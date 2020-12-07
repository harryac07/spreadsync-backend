
import * as db from "../knexfile";
import * as knex from 'knex';
const environment = process.env.ENVIRONMENT || "development";
const config = db[environment];

interface Knex extends knex {
  transaction: any
}


const instance: Knex = knex(config as knex.Config);

console.info(
  `Will connect to postgres://${config.connection.user}@${config.connection.host
  }/${config.connection.database}`
);
instance
  .raw('select 1')
  .then(() => {
    console.info(`Connected to database - OK`);
  })
  .catch(err => {
    console.error(`Failed to connect to database: ${err}`);
    process.exit(1);
  });

// export const database = () => instance;
export default instance;