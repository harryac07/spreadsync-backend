const db = require("../db");

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
  return db("user").select();
};

/**
 * getUserById
 * @param {String}userId - Lookup userId
 * @returns {Array}
 */
const getUserById = (userId = "") => {
  return db("user").select().where({
    id: userId,
  });
};

module.exports = {
  getAllUsers,
  getUserById,
};
