const moment = require('moment');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const db = require('../../models/db');
const { User, Account } = require('../../models');

const { sendEmailConfirmationEmail } = require('../../util/');
/**
 * _createUserAndAccount
 * @param {Object} payload - req payload
 * @returns {Array} created user response array
 **/
const _createUserAndAccount = async (payload = {}) => {
  try {
    let user = [];
    const { account_name } = payload;

    // hash the provided password
    const hashPassword = await User.hashPassword(payload.password);

    // create user and account
    await db.transaction(async function (trx) {
      delete payload.account_name;
      user = await User.createUser(
        {
          ...payload,
          password: hashPassword,
          is_active: false,
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
      // send confirmation email
      await sendEmailConfirmationEmail({
        email: payload.email,
        firstname:
          payload.firstname.charAt(0).toUpperCase() +
          payload.firstname.substr(1).toLowerCase(),
        token: jwt.sign(
          { user_id: user[0].id, is_active: true },
          process.env.INVITATION_JWT_SECRET,
        ),
      });
    });
    return user;
  } catch (e) {
    console.error(e);
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
const _updateUser = async (payload = {}, token) => {
  try {
    // verify token is valid
    var decoded = jwt.verify(token, process.env.INVITATION_JWT_SECRET) || {};
    if (decoded.email && decoded.email !== payload.email) {
      throw new Error('invalid token');
    }
    // hash the provided password
    const hashPassword = await User.hashPassword(payload.password);

    // create user and account
    delete payload.account_name;
    // delete payload.email;
    const user = await User.updateUserByEmail(payload.email, {
      ...payload,
      password: hashPassword,
      is_active: true,
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

const signup = async (req, res) => {
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
        let user = [];

        const userRes = await User.getUserByEmail(email);

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
        console.error(e.stack);
        res.status(500).json({
          message: e.message || 'Invalid Request',
        });
      }
    },
  )(req, res);
};

const login = async (req, res) => {
  passport.authenticate(
    'login',
    { session: false },
    async (err, token, info) => {
      try {
        if (err) {
          throw new Error(err);
        }
        if (!token) {
          throw new Error(
            info.message
              ? info.message
              : 'User not found. Please provide valid credentials!',
          );
        }
        res.status(200).json({ token });
      } catch (error) {
        console.error(error.stack);
        res.status(500).json({
          message: error.message || 'Invalid Request',
        });
      }
    },
  )(req, res);
};

module.exports = {
  signup,
  login,
};
