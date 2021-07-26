import db from '../../models/db';
import { Account, Project } from '../../models';

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
    const payload = req.body;
    const account = await Account.createAccount(payload);
    res.status(200).json(account);
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
  updateAccount,
  deleteAccount,
  getAccountByAccountName,
};
