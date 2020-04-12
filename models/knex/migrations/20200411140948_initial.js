const {
  trigger_insert_into_subscription_history,
  trigger_insert_into_job_history,
  trigger_insert_into_user_involvement_history,
  trigger_insert_into_job_schedule_history,
} = require("../triggers");

module.exports.up = async (knex) => {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE SCHEMA IF NOT EXISTS history;

    CREATE TABLE IF NOT EXISTS "user"(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email text UNIQUE,
      firstname text,
      lastname text,
      phone text,
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS account(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text UNIQUE,
      owner UUID REFERENCES "user"(id),
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
      created_by UUID REFERENCES "user"(id),
      created_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_schedule(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job UUID REFERENCES job(id),
      type text, --manual or automatic
      frequency text,
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_on TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS history.job_schedule_history(
      job_schedule UUID REFERENCES job_schedule(id),
      job UUID REFERENCES job(id),
      type text, --manual or automatic
      frequency text,
      created_on TIMESTAMP
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
      user_role UUID REFERENCES user_role(id),
      user_permission UUID REFERENCES user_permission(id)
    );

    CREATE TABLE IF NOT EXISTS history.user_involvement_history(
      user_involvement UUID REFERENCES user_involvement(id),
      "user" UUID REFERENCES "user"(id),
      project UUID REFERENCES project(id),
      account UUID REFERENCES account(id),
      user_role UUID REFERENCES user_role(id),
      user_permission UUID REFERENCES user_permission(id),
      created_on TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS log(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      source_object text,
      message text,
      status text,
      content text,
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
module.exports.down = async (knex) => {
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
    DROP TABLE IF EXISTS payment cascade;
    DROP TABLE IF EXISTS user_role cascade;
    DROP TABLE IF EXISTS user_permission cascade;
    DROP TABLE IF EXISTS user_involvement cascade;
    DROP TABLE IF EXISTS history.user_involvement_history cascade;
    DROP TABLE IF EXISTS log cascade;
    DROP SCHEMA IF EXISTS history;
  `);
};
