import Knex from 'knex';
import db from '../db';
import { User } from '../../models';
import { Account, AccountPayload } from 'src/types';

/**
 * createAccount
 * @param {Object}reqPayload - request payload
 * @param {Object}dbTrx - databse transaction object
 * @returns {Array}
 */
const createAccount = (
  reqPayload: AccountPayload,
  dbTrx: Knex = db
): Promise<Account[]> => {
  return dbTrx('account').insert(reqPayload).returning('*');
};

/**
 * updateAccount
 * @param {string}accountId - account id
 * @param {Object}reqPayload - request payload
 * @param {Object}dbTrx - databse transaction object
 * @returns {Array}
 */
const updateAccount = (
  accountId: string,
  reqPayload: Partial<AccountPayload>,
  dbTrx: Knex = db
): Promise<Account[]> => {
  return dbTrx('account')
    .where({ id: accountId })
    .update(reqPayload).returning('*');
};

/**
 * deleteAccount
 * @param {string}accountId - account id
 * @param {Object}dbTrx - databse transaction object
 * @returns {Array}
 */
const deleteAccount = (
  accountId: string,
  dbTrx: Knex = db
): Promise<Account[]> => {
  return dbTrx('account')
    .where({ id: accountId })
    .del();
};

/**
 * getAllAccounts
 * @returns {Array}
 */
const getAllAccounts = async (): Promise<Account[]> => {
  return db('account').select();
};

const getAccountById = async (accountId: string): Promise<Account[]> => {
  return db('account').select().where({ id: accountId });
};

const isAccountAdmin = async (userIdOrEmail: string): Promise<boolean> => {
  let userId = userIdOrEmail;
  if (!userId) {
    return false;
  }

  if (userIdOrEmail?.includes('@')) {
    // checking with email
    const [user] = await User.getUserByEmail(userIdOrEmail);
    userId = user.id;
    if (!userId) {
      return false;
    }
  }

  const [account] = await db('account').select().where({ admin: userId });
  if (account) {
    return true;
  }
  return false;
};

/**
 * getAccountByAccountName
 * @param {String}accountName - accountName
 * @param {Boolean}allFields - return all fields from the table
 * @returns {Array}
 */
const getAccountByAccountName = async (
  accountName: string = '',
  allFields: boolean = false
): Promise<Account[] | Pick<Account, 'id' | 'name'>> => {
  if (allFields) {
    return db('account')
      .select()
      .where(db.raw('LOWER("name") = ?', `${accountName.toLowerCase()}`));
  }
  return db('account')
    .select('id', 'name')
    .where(db.raw('LOWER("name") = ?', `${accountName.toLowerCase()}`));
};

export default {
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAllAccounts,
  getAccountByAccountName,
  isAccountAdmin,
};
