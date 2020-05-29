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

module.exports = {
  getAllAccounts,
  createAccount,
};
