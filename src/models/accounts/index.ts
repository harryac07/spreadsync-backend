import db from '../db';
import Knex from 'knex';
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
 * getAllAccounts
 * @returns {Array}
 */
const getAllAccounts = async (): Promise<Account[]> => {
  return db('account').select();
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
  createAccount,
  getAllAccounts,
  getAccountByAccountName,
};
