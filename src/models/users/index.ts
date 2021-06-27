import bcrypt from 'bcryptjs';
import db from '../db';
import { UserType, CreateUserPayload, UpdateUserPayload, UserInvolvement, UserInvolvementPayload, UserAuth, Account } from 'src/types';
import Knex from 'knex';

type UpdateUserById = (userId: string, reqPayload: UpdateUserPayload, db?: Knex) => Promise<UserType[]>;

/**
 * createUser
 * @param {Object}reqPayload - request payload
 * @param {Object}dbTrx - databse transaction object
 * @returns {Array}
 */
const createUser = (reqPayload: CreateUserPayload, dbTrx: Knex = db): Promise<UserType[]> => {
  return dbTrx('user').insert(reqPayload).returning('*');
};

/**
 * getAllUsers
 * @returns {Array}
 */
const getAllUsers = async (): Promise<UserType[]> => {
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
 * updateUserById
 * @param {String}userId - userId to update
 * @param {Object}reqPayload - request payload
 * @param {Object}dbTrx - databse transaction object
 * @returns {Array}
 */
const updateUserById: UpdateUserById = (userId, reqPayload, dbTrx = db) => {
  return dbTrx('user').update(reqPayload).where({ id: userId }).returning('*');
};

/**
 * updateUserByEmail
 * @param {String}email - email to update
 * @param {Object}reqPayload - request payload
 * @param {Object}dbTrx - databse transaction object
 * @returns {Array}
 */
const updateUserByEmail = (email, reqPayload, dbTrx = db): Promise<any[]> => {
  return dbTrx('user').update(reqPayload).where({ email }).returning('*');
};

/**
 * getUserById
 * @param {String}userId - Lookup userId
 * @returns {Array}
 */
const getUserById = (userId: string): Promise<UserType[]> => {
  return db('user').select().where({
    id: userId,
  });
};

/**
 * getUserByEmail
 * @param {String}email - Lookup email
 * @returns {Array}
 */
const getUserByEmail = (email: string): Promise<UserType[]> => {
  return db('user').select().where({
    email,
  });
};

/**
 * createProjectInvolvement
 * @param {Object}payload - req payload
 * @param {String}payload.user - user id
 * @param {String}payload.project - project id
 * @param {String}payload.account - account id
 * @param {String}payload.project_role - project_role
 * @param {String}payload.project_permission - project_permission
 * @param {Object}dbTrx - databse transaction object
 * @returns {Array}
 */
const createProjectInvolvement = (payload: UserInvolvementPayload, dbTrx: Knex = db): Promise<UserInvolvement[]> => {
  return dbTrx('user_involvement').insert(payload).returning('*');
};

/**
 * trackUserAuthToken
 * @param {Object}payload - payload to store in database
 * @returns {Array}
 */
const trackUserAuthToken = async (payload: UserAuth): Promise<void> => {
  return db('user_auth').insert(payload);
};

/**
 * getAllAccountsForUser
 * @param {String}user_id -  user id
 * @returns {Array}
 */
const getAllAccountsForUser = (user_id: string): Promise<Array<Account & { user: string }>> => {
  return db('account')
    .select('account.*', 'user.id as user', 'user.email as email')
    .from('account')
    .innerJoin('user', 'user.id', 'account.admin')
    .where({
      admin: user_id,
    })
    .union(function () {
      this.select('account.*', 'i.user', 'user.email as email')
        .distinct()
        .from('user_involvement AS i')
        .innerJoin('account', 'account.id', 'i.account')
        .innerJoin('user', 'user.id', 'account.admin')
        .where({
          user: user_id,
        });
    });
};

/**
 * hashPassword
 * @param {String}plainTextPassword - password to convert to hash
 * @returns {String} hashPassword
 */
const hashPassword = async (plainTextPassword: string): Promise<string> => {
  const hash = await bcrypt.hash(plainTextPassword, 10);
  return hash;
};

/**
 * isValidPassword
 * @param {String}email - email for user lookup
 * @param {String}password - password to compare
 * @returns {Boolean}
 */
const isValidPassword = async (email: string, password: string): Promise<boolean> => {
  const userRes = await getUserByEmail(email);
  const user = userRes[0] || {};
  //Hashes the password sent by the user for login and checks if the hashed password stored in the
  //database matches the one sent. Returns true if it does else false.
  const compare = await bcrypt.compare(password, user.password);
  return compare;
};

export default {
  createUser,
  getAllUsers,
  updateUserById,
  updateUserByEmail,
  getUserById,
  getUserByEmail,
  getAllAccountsForUser,
  trackUserAuthToken,
  hashPassword,
  isValidPassword,
  createProjectInvolvement,
};
