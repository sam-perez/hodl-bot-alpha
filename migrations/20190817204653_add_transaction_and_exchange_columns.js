exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE purchase_ledger ADD COLUMN transaction_id VARCHAR(255) default null;
    ALTER TABLE purchase_ledger ADD COLUMN exchange VARCHAR(255) default 'COINBASE_GDAX';
  `);
};

exports.down = function(knex) {
  return knex.raw(`
      ALTER TABLE purchase_ledger DROP COLUMN transaction_id;
      ALTER TABLE purchase_ledger DROP COLUMN exchange;
  `);
};
