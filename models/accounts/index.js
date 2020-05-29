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

module.exports = {
  createAccount,
  getAllAccounts,
};
