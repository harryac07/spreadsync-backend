exports.up = async (knex) => {
  await knex.raw(`
    ALTER TABLE "user"
      ADD COLUMN password TEXT,
      ADD COLUMN account UUID REFERENCES account(id),
      ADD COLUMN is_owner BOOLEAN NOT NULL DEFAULT FALSE,
      ALTER COLUMN email SET NOT NULL;
    
    ALTER TABLE "user" 
      ADD CONSTRAINT email_unique UNIQUE (email);
  `);
};

exports.down = async (knex) => {
  await knex.raw(`
    ALTER TABLE "user"
      DROP COLUMN password,
      DROP COLUMN account,
      DROP COLUMN is_owner;
    
    ALTER TABLE "user" 
      DROP CONSTRAINT email_unique;
  `);
};
