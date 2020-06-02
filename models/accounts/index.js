const db = require('../db');

/**
 * createAccount
 * @param {Object}reqPayload - request payload
 * @param {Object}dbTrx - databse transaction object
 * @returns {Array}
 */
const createAccount = (reqPayload, dbTrx = db) => {
  return dbTrx('account').insert(reqPayload).returning('*');
};

/**
 * getAllAccounts
 * @returns {Array}
 */
const getAllAccounts = async () => {
  /*   
    ---Raw query example---
    const userRes = await db.raw(`
      SELECT * FROM "user";
    `);
    return userRes.rows; 
  */
  return db('account').select();
};

/**
 * getAccountByAccountName
 * @param {String}accountName - accountName
 * @param {Boolean}allFields - return all fields from the table
 * @returns {Array}
 */
const getAccountByAccountName = async (accountName = '', allFields = false) => {
  if (allFields) {
    return db('account')
      .select()
      .where(db.raw('LOWER("name") = ?', `${accountName.toLowerCase()}`));
  }
  return db('account')
    .select('id', 'name')
    .where(db.raw('LOWER("name") = ?', `${accountName.toLowerCase()}`));
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountByAccountName,
};
