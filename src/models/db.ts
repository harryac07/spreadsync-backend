
import * as knexfile from "../knexfile";
import knex from 'knex';
const environment = process.env.ENVIRONMENT || "development";
const config = knexfile[environment];

interface Knex extends knex {
  transaction: any
}
const instance: Knex = knex(config as knex.Config);

// export default instance;
export default instance;