exports.up = function(knex) {
  return knex.raw(
    [
      'CREATE SEQUENCE global_id_sequence',
      `
            CREATE TABLE purchase_ledger (
            id BIGINT PRIMARY KEY DEFAULT NEXTVAL('global_id_sequence'),
            config_id VARCHAR(255),
            dollars_used_to_buy NUMERIC(8, 2),
            amount_of_crypto_purchased NUMERIC(8, 2),
            gdax_product_id VARCHAR(255),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `,
      'create index purchase_ledger_config_id_idx ON purchase_ledger (config_id)'
    ].join(';')
  );
};

exports.down = function(knex) {
  return knex.raw(`
    DROP SEQUENCE global_id_sequence;
    DROP TABLE purchase_ledger;
  `);
};
