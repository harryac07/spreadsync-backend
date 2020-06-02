const { Account } = require('../../models');

const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.getAllAccounts();
    res.status(200).json(accounts);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
};

const createAccount = async (req, res) => {
  try {
    const payload = req.body;
    const account = await Account.createAccount(payload);
    res.status(200).json(account);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
};

const getAccountByAccountName = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      throw new Error('Account name is required!');
    }
    const account = await Account.getAccountByAccountName(name);
    res.status(200).json(account);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
};

module.exports = {
  getAllAccounts,
  createAccount,
  getAccountByAccountName,
};
