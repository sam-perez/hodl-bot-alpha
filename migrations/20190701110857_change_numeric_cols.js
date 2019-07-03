exports.up = function(knex) {
  return knex.raw(`
      ALTER TABLE purchase_ledger ALTER COLUMN dollars_used_to_buy type NUMERIC;
      ALTER TABLE purchase_ledger ALTER COLUMN amount_of_crypto_purchased type NUMERIC;
      ALTER TABLE purchase_ledger ALTER COLUMN current_exchange_rate type NUMERIC;
  `);
};

exports.down = function(knex) {
  return knex.raw(`
      ALTER TABLE purchase_ledger ALTER COLUMN dollars_used_to_buy type NUMERIC(8,2);
      ALTER TABLE purchase_ledger ALTER COLUMN amount_of_crypto_purchased type NUMERIC(8,2);
      ALTER TABLE purchase_ledger ALTER COLUMN current_exchange_rate type NUMERIC(8,2);
  `);
};
