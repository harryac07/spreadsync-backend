import db from '../../models/db';
import { Account, Project, User } from '../../models';
import {
  sendAccountOwnershipInvitationEmailToUser,
  notifyUserForProjectInvitation,
  notifyUserForAccountOwnershipInvitation,
  generateInvitationToken,
} from '../../util/';

const getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.getAllAccounts();
    res.status(200).json(accounts);
  } catch (error) {
    next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const { id: userId } = req.locals.user;
    const payload = {
      name: req.body?.name,
      admin: userId
    };
    if (!payload.name || !payload.admin) {
      throw new Error(`Account name and user admin is required!`);
    }
    const account = await Account.createAccount(payload);
    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
};

const transferAccountOwnership = async (req, res, next) => {
  try {
    const { id: userId } = req.locals.user;
    const { id: accountId } = req.params;
    const email = req.body?.email;
    if (!email) {
      throw new Error(`Email is required to transfer the account ownership!`);
    }

    // Check if requesting user is account super Admin
    const isUserAccountAdmin = await Account.isAccountAdmin(userId);
    if (!isUserAccountAdmin) {
      throw new Error(`Request forbidden! You must be the account owner.`);
    }
    /* Check if user already exists and is active */
    const [user] = await User.getUserByEmail(email);
    if (user) {
      await db.transaction(async trx => {
        // make user an account admin
        const [account] = await trx('account')
          .where({
            id: accountId
          })
          .update({
            admin: user?.id
          })
          .returning('*');
        if (!account?.id) {
          throw new Error('Account not found with the provided id');
        }
        // send transfership email to the user just the notification
        await notifyUserForAccountOwnershipInvitation({
          email,
          accountName: account?.name,
          extraText: !user?.is_active ? `<p>Note: <i>You have a pending invitation. Please accept the invitation and continue using Spreadsync</i><p/>` : ''
        });
      });
    } else {
      const token = generateInvitationToken({
        accountId,
        email,
        signupWithoutAccount: true
      });
      await db.transaction(async trx => {
        // create user
        const [newUser] = await User.createUser(
          {
            email,
            password: 'temp password',
          },
          trx,
        );
        // make user an account admin
        const [account] = await trx('account')
          .where({
            id: accountId
          })
          .update({
            admin: newUser?.id
          })
          .returning('*');
        if (!account?.id) {
          throw new Error('Account not found with the provided id');
        }
        // send sign up invitation
        await sendAccountOwnershipInvitationEmailToUser({
          email,
          token,
          accountName: account?.name
        });
      });
    }
    res.status(200).json({ data: 'Ok' });
  } catch (error) {
    next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    await Account.updateAccount(id, payload);
    res.status(200).json({ data: 'Account updated successfully!' });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Account.deleteAccount(id);
    res.status(200).json({ data: 'Account updated successfully!' });
  } catch (error) {
    next(error);
  }
};

const getAccountByAccountName = async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!name) {
      throw new Error('Account name is required!');
    }
    const account = await Account.getAccountByAccountName(name);
    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
};

export {
  getAllAccounts,
  createAccount,
  transferAccountOwnership,
  updateAccount,
  deleteAccount,
  getAccountByAccountName,
};
