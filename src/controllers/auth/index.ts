import moment from 'moment';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import db from '../../models/db';
import { User, Account, SocialAuth } from '../../models';

import GoogleApi from '../../util/googleAuth';
import { sendEmailConfirmationEmail } from '../../util/';
import { JwtDecodedType, UserAuth, UserType, SocialAuth as SocialAuthTypes, CreateSocialAuthPayload as CreateSocialAuthPayloadTypes, socialTypes } from '../../types';

type CreateUserAndAccountType = {
  account_name?: string;
  email: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  phone?: string | number;
  company?: string;
  is_active?: boolean;
};

/**
 * _createUserAndAccount
 * @param {Object} payload - req payload
 * @param {Boolean} sendConfirmationEmail - send confirmation email. True by default
 * @param {Boolean} existingUserId - If user id exists, providing this value updates the existing user.
 * @returns {Array} created user response array
 **/
export const _createUserAndAccount = async (
  payload: CreateUserAndAccountType | any,
  sendConfirmationEmail = true,
  existingUserId = ''
): Promise<UserType[]> => {

  try {
    let user: UserType[] = [];
    const { account_name } = payload;

    // hash the provided password
    const hashPassword = await User.hashPassword(payload.password);

    // create user and account
    await db.transaction(async function (trx) {
      delete payload.account_name;
      if (existingUserId) {
        user = await User.updateUserById(
          existingUserId,
          {
            ...payload,
            password: hashPassword,
            is_active: sendConfirmationEmail ? false : true,
          },
          trx,
        );
      } else {
        user = await User.createUser(
          {
            ...payload,
            password: hashPassword,
            is_active: sendConfirmationEmail ? false : true,
          },
          trx,
        );
      }
      // create Account
      if (account_name) {
        await Account.createAccount(
          {
            name: account_name,
            admin: user[0].id,
          },
          trx,
        );
      }
      if (sendConfirmationEmail) {
        // send confirmation email
        await sendEmailConfirmationEmail({
          email: payload.email,
          firstname:
            payload.firstname.charAt(0).toUpperCase() +
            payload.firstname.substr(1).toLowerCase(),
          token: jwt.sign(
            { user_id: user[0].id },
            process.env.INVITATION_JWT_SECRET as jwt.Secret,
          ),
        });
      }
    });
    return user;
  } catch (e) {
    console.error(e.stack);
    throw new Error(
      'Database error occured while creating user account. Please try again!',
    );
  }
};
/**
 * _updateUser
 * @param {Object} payload - req payload
 * @param {String} token - invitation token
 * @returns {Array} created user response array
 **/
const _updateUser = async (payload: CreateUserAndAccountType, token: string): Promise<UserType[]> => {
  try {
    // verify token is valid
    const decoded = jwt.verify(token, process.env.INVITATION_JWT_SECRET as jwt.Secret);
    if ((decoded as JwtDecodedType).email && (decoded as JwtDecodedType).email !== payload.email) {
      throw new Error('invalid token');
    }

    let user: UserType[] = [];
    const { account_name } = payload;

    // hash the provided password
    const hashPassword = await User.hashPassword(payload.password as string);

    // create user and account
    await db.transaction(async function (trx) {
      // update user
      delete payload.account_name;
      user = await User.updateUserByEmail(
        payload.email,
        {
          ...payload,
          password: hashPassword,
          is_active: true,
        },
        trx,
      );
      // create Account
      if (account_name) {
        await Account.createAccount(
          {
            name: account_name,
            admin: user[0].id,
          },
          trx,
        );
      }
    });
    return user;
  } catch (e) {
    console.error(e);
    if (
      e.message.includes('invalid signature') ||
      e.message.includes('invalid token')
    ) {
      throw new Error('The invitation token is no longer valid.');
    }
    throw new Error(
      'Database error occured while creating user. Please try again!',
    );
  }
};

/**
 * _signAndGetAuthToken
 * @param {String} id - user id
 * @param {String} email - user email
 * @returns {Object} token payload
 **/
const _signAndGetAuthToken = (userObject: { id: string; email: string }): UserAuth => {
  const token = jwt.sign(
    {
      user: {
        id: userObject.id,
        email: userObject.email,
      },
    },
    process.env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: '12h',
    },
  );

  const authTokenPayload = {
    user_id: userObject.id,
    last_logged_in: moment().format('YYYY-MM-DD HH:mm:ss'),
    token: token,
    is_token_valid: true,
  };
  return authTokenPayload;
};

const signup = async (req, res, next) => {
  passport.authenticate(
    'signup',
    { session: false },
    async (err, data, info) => {
      try {
        if (err) {
          throw new Error(err);
        }
        if (!data) {
          throw new Error('Signup failed. Email or password missing!');
        }

        const { token } = req.query;
        const payload = req.body;
        const { email } = payload;
        let user: UserType[] = [];

        const userRes: UserType[] = await User.getUserByEmail(email);

        if (token) {
          if (userRes.length > 0 && userRes[0].is_active) {
            throw new Error('User already registered with this token! Log in.');
          }
          if (userRes.length === 0) {
            throw new Error(
              'The invitation is no longer valid. Please sign up fresh /signup',
            );
          }
          /* User coming from project invitation */
          user = await _updateUser(payload, token);
        } else {
          /* User coming from regular sign up */

          // check if user already exists
          if (userRes.length > 0) {
            throw new Error('User exists already!');
          }
          user = await _createUserAndAccount(payload);
        }
        res.status(201).json(user);
      } catch (e) {
        next(e);
      }
    },
  )(req, res, next);
};

const login = async (req, res, next) => {
  passport.authenticate(
    'login',
    { session: false },
    async (err, data, info) => {
      try {
        if (err) {
          throw new Error(err);
        }
        if (!data) {
          throw new Error(
            info.message
              ? info.message
              : 'User not found. Please provide valid credentials!',
          );
        }
        const payload = req.body;
        const { email, password } = payload;

        //Find the user associated with the email provided by the user
        const userRes = await User.getUserByEmail(email);
        const user = userRes[0];
        if (!user) {
          throw new Error('User not found. Provide valid email!');
        }
        const validate = await User.isValidPassword(email, password);
        if (!validate) {
          throw new Error('Password incorrect!');
        }

        if (!user.is_active) {
          throw new Error(
            'User has not confirmed email yet. Please check your email and verify.',
          );
        }

        const authTokenPayload = _signAndGetAuthToken({
          email: user.email,
          id: user.id,
        });
        await User.trackUserAuthToken(authTokenPayload);

        res.status(200).json({ token: authTokenPayload.token });
      } catch (e) {
        next(e);
      }
    },
  )(req, res, next);
};

const loginAuth = async (req, res, next) => {
  const { authCode, auth = '', signupWithoutAccount = false } = req.body;
  try {
    if (auth !== 'google' || !authCode) {
      throw new Error('Authentication not allowed!');
    }

    const googleClient = await GoogleApi.init(authCode);
    const userDetails = await googleClient.getUserDetails();

    const userRes = await User.getUserByEmail(userDetails.email);
    let user = userRes[0];
    if (userRes.length === 0 || user?.password === 'temp password') {
      // create new user to DB but dont send confirmation email
      const createdUser = await _createUserAndAccount(
        {
          email: userDetails.email,
          password: userDetails.email + moment(),
          firstname: userDetails.given_name,
          lastname: userDetails.family_name,
          account_name: signupWithoutAccount ? '' : `Account ${userDetails.email}`,
          is_using_social_login: true
        },
        false,
        user?.id
      );
      user = createdUser[0];
    }

    if (!user.is_active) {
      throw new Error('User is not active!');
    }

    const authTokenPayload = _signAndGetAuthToken({
      email: user.email,
      id: user.id,
    });
    await User.trackUserAuthToken(authTokenPayload);

    res.status(200).json({ token: authTokenPayload.token });
  } catch (e) {
    next(e);
  }
};

const activateUser = async (req, res, next) => {
  try {
    const { token } = req.body;
    // verify token is valid
    const decoded = jwt.verify(token, process.env.INVITATION_JWT_SECRET as jwt.Secret) || {};
    const { user_id } = decoded as JwtDecodedType;
    if (!user_id) {
      throw new Error('Invalid token');
    }
    const userRes = await User.getUserById(user_id);
    const user = userRes[0];

    if (userRes.length === 0) {
      throw new Error('User not found');
    }

    if (user.is_active) {
      throw new Error('Token is no longer valid!');
    }

    /* Acticate user */
    await User.updateUserById(user_id, {
      is_active: true,
    });
    res.status(200).json({
      message: 'User activated successfully!',
    });
  } catch (e) {
    next(e);
  }
};

const saveSocialAuth = async (req, res, next) => {
  type reqPayloadType = { authCode: string; jobId: string; type: 'source' | 'target' };
  const { authCode, jobId, type }: reqPayloadType = req.body;
  const { name }: { name: socialTypes } = req.params;

  const { id: userId } = req.locals.user;
  try {
    if (!authCode) {
      throw new Error('Authentication not allowed!');
    }
    if (!jobId) {
      throw new Error('Job id is required!');
    }

    /* Generate token and store to social_auth */
    const googleClient = await GoogleApi.init(authCode);
    const newlyCreatedTokens = await googleClient.getTokens()

    const reqPayload: CreateSocialAuthPayloadTypes = {
      ...newlyCreatedTokens,
      job_id: jobId,
      user_id: userId,
      social_name: name,
      type: type
    };
    // delete existing old social auth for the job and type
    await SocialAuth.deleteSocialAuthForJobByType(jobId, type);

    // Create social auth for the job and type
    await SocialAuth.createSocialAuthForJob(reqPayload);
    res.status(200).json({
      message: 'Social auth created successfully!',
    });
  } catch (e) {
    next(e);
  }
}

const getSocialAuthByJobId = async (req, res, next) => {
  try {
    type ParamsTypes = { name: socialTypes; job_id: string };
    const { name, job_id }: ParamsTypes = req.params;
    const filter = {
      social_name: name,
    }
    const fieldsOnly: string[] = ['id', 'user_id', 'type', 'social_name'];
    const socialAuthForJob = await SocialAuth.getSocialAuthByJobId(job_id, filter, fieldsOnly);
    res.status(200).json(socialAuthForJob);
  } catch (e) {
    next(e);
  }
}

export {
  signup,
  login,
  loginAuth,
  activateUser,

  saveSocialAuth,
  getSocialAuthByJobId
};
