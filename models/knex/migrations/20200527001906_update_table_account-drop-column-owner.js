exports.up = async (knex) => {
  await knex.raw(`
    ALTER TABLE account
      DROP COLUMN owner;
  `);
};

exports.down = async (knex) => {
  await knex.raw(`
    ALTER TABLE account
      ADD COLUMN owner UUID REFERENCES "user"(id);
  `);
};
