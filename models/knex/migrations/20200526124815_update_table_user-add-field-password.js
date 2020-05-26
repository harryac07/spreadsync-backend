exports.up = async (knex) => {
  await knex.raw(`
    ALTER TABLE "user"
    ADD COLUMN password TEXT;
  `);
};

exports.down = async (knex) => {
  await knex.raw(`
    ALTER TABLE "user"
    DROP COLUMN password;
  `);
};
