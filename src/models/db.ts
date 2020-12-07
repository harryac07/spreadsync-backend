
import * as db from "../knexfile";
import * as knex from 'knex';
const environment = process.env.ENVIRONMENT || "development";
const config = db[environment];

interface Knex extends knex {
  transaction: any
}
const instance: Knex = knex(config as knex.Config);

export default instance;