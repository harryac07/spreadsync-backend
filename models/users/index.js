const bcrypt = require('bcryptjs');
const db = require('../db');

/**
 * createUser
 * @param {Object}reqPayload - request payload
 * @returns {Array}
 */
const createUser = (reqPayload) => {
  return db('user').insert(reqPayload).returning('*');
};

/**
 * getAllUsers
 * @returns {Array}
 */
const getAllUsers = async () => {
  /*   
    ---Raw query example---
    const userRes = await db.raw(`
      SELECT * FROM "user";
    `);
    return userRes.rows; 
  */
  return db('user').select();
};

/**
 * getUserById
 * @param {String}userId - Lookup userId
 * @returns {Array}
 */
const getUserById = (userId = '') => {
  return db('user').select().where({
    id: userId,
  });
};

/**
 * getUserByEmail
 * @param {String}email - Lookup email
 * @returns {Array}
 */
const getUserByEmail = (email = '') => {
  return db('user').select().where({
    email,
  });
};

/**
 * hashPassword
 * @param {String}plainTextPassword - password to convert to hash
 * @returns {String} hashPassword
 */
const hashPassword = async (plainTextPassword) => {
  const hash = await bcrypt.hash(plainTextPassword, 10);
  return hash;
};

/**
 * isValidPassword
 * @param {String}email - email for user lookup
 * @param {String}password - password to compare
 * @returns {Boolean}
 */
const isValidPassword = async (email, password) => {
  const userRes = await getUserByEmail(email);
  const user = userRes[0] || {};
  //Hashes the password sent by the user for login and checks if the hashed password stored in the
  //database matches the one sent. Returns true if it does else false.
  const compare = await bcrypt.compare(password, user.password);
  return compare;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  hashPassword,
  isValidPassword,
};
