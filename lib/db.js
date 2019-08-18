const knex = require('knex');

module.exports = {
  getDBManager: () => {
    let masterConnection = null;
    const getMasterConnection = () => {
      if (masterConnection === null) {
        const config = {
          client: 'pg',
          pool: {
            min: 1,
            max: 1,
            requestTimeout: 10000
          },
          connection: {
            PORT: process.env.PSQL_DB_PORT || 5432,
            host: process.env.PSQL_DB_HOST,
            user: process.env.PSQL_DB_USERNAME,
            password: process.env.PSQL_DB_PASSWORD,
            database: process.env.PSQL_DB_DATABASE,
            charset: 'utf8'
          },
          acquireConnectionTimeout: 30000,
          debug: false
        };

        masterConnection = knex(config);
      }

      return masterConnection;
    };

    const closeAllConnections = async () => {
      if (masterConnection !== null) {
        await masterConnection.destroy();
        console.log('Closed master connection');
        // have to null this out because lambdas will reuse container!!!
        masterConnection = null;
      }
    };

    return {
      closeAllConnections,
      getAmountSpentForConfigId: async ({ configId }) => {
        const dbConnection = getMasterConnection();
        const { rows } = await dbConnection.raw(
          `
            select coalesce(sum(dollars_used_to_buy), 0) as amount_spent from purchase_ledger
            where config_id = ? and dollars_used_to_buy is not null and succeeded = true
        `,
          [ configId ]
        );

        return { amountSpent: rows[0].amount_spent };
      },
      getLastPurchaseDateForConfigId: async ({ configId }) => {
        const dbConnection = getMasterConnection();
        const { rows } = await dbConnection.raw(
          `
            select max(created_at) as last_purchase_date from purchase_ledger
            where
                config_id = ? and
                dollars_used_to_buy is not null and
                dollars_used_to_buy > 0 and
                succeeded = true
        `,
          [ configId ]
        );

        return { lastPurchaseDate: rows[0].last_purchase_date };
      },
      saveTransaction: async ({
        configId,
        dollarsUsedToBuy,
        amountOfCryptoPurchased,
        productId,
        succeeded,
        currentPriceOfProduct,
        transactionId,
        exchange
      }) => {
        const dbConnection = getMasterConnection();
        const { rows } = await dbConnection.raw(
          `
            insert into purchase_ledger (config_id, dollars_used_to_buy, amount_of_crypto_purchased, gdax_product_id, succeeded, current_exchange_rate, transaction_id, exchange)
            values (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            configId,
            dollarsUsedToBuy,
            amountOfCryptoPurchased,
            productId,
            succeeded,
            currentPriceOfProduct,
            transactionId,
            exchange
          ]
        );

        return { result: rows };
      }
    };
  }
};
