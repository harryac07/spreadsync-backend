import jwt from 'jsonwebtoken';
import { User } from '../../models';
import db from '../../models/db';
import { sendEmailConfirmationEmail } from '../../util/';

const getAllUsers = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (projectId) {
      const users = await User.getAllUsers();
    }
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // sooner we will catch this from session i.e. req.locals.userId
    const users = await User.getUserById(id);
    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    if (!payload?.firstname || !payload?.lastname || !payload?.email) {
      throw new Error('Please fill up all required fields');
    }

    // Get user
    const [currentUser] = await User.getUserById(id);
    if (currentUser?.email === payload?.email) {
      await User.updateUserById(id, payload);
    } else {
      await db.transaction(async (trx) => {
        // send email verification notification to user in email
        await sendEmailConfirmationEmail({
          email: payload.email,
          firstname:
            payload.firstname.charAt(0).toUpperCase() +
            payload.firstname.substr(1).toLowerCase(),
          token: jwt.sign(
            { user_id: id },
            process.env.INVITATION_JWT_SECRET as jwt.Secret,
          ),
        });
        // update user
        await User.updateUserById(id, { ...payload, is_active: false }, trx);
      });
    }
    res.status(200).json({ data: 'User updated successfully!' });
  } catch (e) {
    next(e);
  }
};

const updateUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, password, new_password, repeated_new_password } = req.body;

    const validate = await User.isValidPassword(email, password);
    if (!validate) {
      throw new Error('Original password incorrect!');
    }

    if (new_password !== repeated_new_password) {
      throw new Error('Password unmatched!');
    }
    if (password === new_password) {
      res.status(200).json({ data: 'Same password provided!' });
      return;
    }

    // hash the provided password
    const hashPassword = await User.hashPassword(new_password);
    // Update new password
    await User.updateUserById(id, { password: hashPassword },);

    res.status(200).json({ data: 'Password updated successfully!' });
  } catch (e) {
    next(e);
  }
}

const getAllAccountsForUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // sooner we will catch this from session i.e. req.locals.userId
    const accounts = await User.getAllAccountsForUser(id);
    res.status(200).json(accounts);
  } catch (e) {
    next(e);
  }
};

export {
  getAllUsers,
  getUserById,
  updateUserById,
  updateUserPassword,
  getAllAccountsForUser,
};
