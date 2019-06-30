exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE purchase_ledger ADD COLUMN succeeded BOOLEAN;
    ALTER TABLE purchase_ledger ADD COLUMN current_exchange_rate NUMERIC(8, 2);
`);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE purchase_ledger DROP COLUMN succeeded;
    ALTER TABLE purchase_ledger DROP COLUMN current_exchange_rate;
`);
};
