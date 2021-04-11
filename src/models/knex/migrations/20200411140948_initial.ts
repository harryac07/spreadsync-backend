import Knex from 'knex';
import {
  trigger_insert_into_subscription_history,
  trigger_insert_into_job_history,
  trigger_insert_into_user_involvement_history,
  trigger_insert_into_job_schedule_history,
} from '../triggers';

export const up = async (knex: Knex) => {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE SCHEMA IF NOT EXISTS history;

    CREATE TABLE IF NOT EXISTS "user"(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email text UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstname text,
      lastname text,
      phone text,
      company text,
      is_active BOOLEAN DEFAULT FALSE,
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_auth(
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES "user"(id),
      last_logged_in TIMESTAMP,
      token TEXT NOT NULL,
      is_token_valid BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS account(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text UNIQUE,
      admin UUID REFERENCES "user"(id),
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plan(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text, --trial, starter, basic, enterprise
      interval text, --month, year
      amount int,
      currency text,
      description text,
      trial_days int
    );

    CREATE TABLE IF NOT EXISTS subscription(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      plan UUID REFERENCES plan(id),
      discount int,
      account UUID REFERENCES account(id),
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS history.subscription_history(
      subscription UUID REFERENCES subscription(id),
      plan UUID REFERENCES plan(id),
      discount int,
      account UUID REFERENCES account(id),
      created_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text,
      description text,
      admin UUID REFERENCES "user"(id),
      account UUID REFERENCES account(id), 
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text,
      description text,
      type text, -- export or sync
      project UUID REFERENCES project(id),
      script text,
      data_source text,
      data_target text,
      created_by UUID REFERENCES "user"(id),
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS history.job_history(
      job UUID REFERENCES job(id),
      name text,
      description text,
      type text, -- export or sync
      project UUID REFERENCES project(id),
      script text,
      data_source text,
      data_target text,
      created_by UUID REFERENCES "user"(id),
      created_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_schedule(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job UUID REFERENCES job(id),
      frequency_name text, --fixed or scheduled
      value int,
      unit text, --minutes, hours, days, months
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS source_database(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job UUID REFERENCES job(id),
      database_type text,
      is_ssl boolean default false,
      alias_name text,
      database_host text,
      database_name text,
      database_port text,
      database_user text,
      database_password text,      
      is_ssh boolean default false,
      ssh_host text,
      ssh_username text,
      ssh_password text,
      ssh_port text,
      ssh_key text,
      data_type text, -- source, target
      created_on TIMESTAMP NOT NULL DEFAULT NOW()    
    );

    CREATE TABLE IF NOT EXISTS history.job_schedule_history(
      job_schedule UUID REFERENCES job_schedule(id),
      job UUID REFERENCES job(id),
      frequency_name text,
      value text,
      unit text,
      created_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_auth(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES "user"(id),
      job_id UUID REFERENCES job(id),
      type text, --target or source
      social_name text, --google
      token_type text,
      expiry_date bigint,
      scope text,
      refresh_token text,
      access_token text,
      id_token text,
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (job_id, type)
    );

    CREATE TABLE IF NOT EXISTS spreadsheet_config(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES "user"(id),
      job_id UUID REFERENCES job(id),
      spreadsheet_id text,
      sheet text,
      include_column_header boolean,
      enrich_type text, --append or replace
      range text,
      type text, --target or source
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (job_id, spreadsheet_id)
    );

    CREATE TABLE IF NOT EXISTS payment(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "user" UUID REFERENCES "user"(id),
      subscription UUID REFERENCES subscription(id),
      account UUID REFERENCES account(id),
      amount int,
      amount_paid int,
      amount_left int,
      status text,
      is_paid boolean,
      created_on TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_role(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text UNIQUE, --Owner, Admin, Developer, Sales, User, Guest
      description text
    );

    CREATE TABLE IF NOT EXISTS user_permission(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text UNIQUE,
      description text
    );

    CREATE TABLE IF NOT EXISTS user_involvement(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "user" UUID REFERENCES "user"(id),
      project UUID REFERENCES project(id),
      account UUID REFERENCES account(id),
      project_role UUID REFERENCES user_role(id),
      project_permission UUID REFERENCES user_permission(id)
    );

    CREATE TABLE IF NOT EXISTS history.user_involvement_history(
      user_involvement UUID REFERENCES user_involvement(id),
      "user" UUID REFERENCES "user"(id),
      project UUID REFERENCES project(id),
      account UUID REFERENCES account(id),
      project_role UUID REFERENCES user_role(id),
      project_permission UUID REFERENCES user_permission(id),
      created_on TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS log(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      source_object text,
      message text,
      status text,
      content text,
      url text,
      created_on TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  /* Create trigger for all history data */
  await knex.raw(`
    ${trigger_insert_into_subscription_history};
    CREATE TRIGGER subscription_history after
    INSERT or UPDATE
    ON subscription for each row execute procedure insert_into_subscription_history();

    ${trigger_insert_into_job_history};
    CREATE TRIGGER job_history after
    INSERT or UPDATE
    ON job for each row execute procedure insert_into_job_history();

    ${trigger_insert_into_user_involvement_history};
    CREATE TRIGGER user_involvement_history after
    INSERT or UPDATE
    ON user_involvement for each row execute procedure insert_into_user_involvement_history();

    ${trigger_insert_into_job_schedule_history};
    CREATE TRIGGER job_schedule_history after
    INSERT or UPDATE
    ON job_schedule for each row execute procedure insert_into_job_schedule_history();
  `);
};
export const down = async (knex: Knex) => {
  await knex.raw(`
    DROP TABLE IF EXISTS "user" cascade;
    DROP TABLE IF EXISTS account cascade;
    DROP TABLE IF EXISTS plan cascade;
    DROP TABLE IF EXISTS subscription cascade;
    DROP TABLE IF EXISTS history.subscription_history cascade;
    DROP TABLE IF EXISTS project cascade;
    DROP TABLE IF EXISTS job cascade;
    DROP TABLE IF EXISTS history.job_history cascade;
    DROP TABLE IF EXISTS job_schedule cascade;
    DROP TABLE IF EXISTS history.job_schedule_history cascade;
    DROP TABLE IF EXISTS source_database cascade;
    DROP TABLE IF EXISTS social_auth cascade;
    DROP TABLE IF EXISTS spreadsheet_config cascade;
    DROP TABLE IF EXISTS payment cascade;
    DROP TABLE IF EXISTS user_role cascade;
    DROP TABLE IF EXISTS user_permission cascade;
    DROP TABLE IF EXISTS user_involvement cascade;
    DROP TABLE IF EXISTS history.user_involvement_history cascade;
    DROP TABLE IF EXISTS log cascade;
    DROP SCHEMA IF EXISTS history;
  `);
};
