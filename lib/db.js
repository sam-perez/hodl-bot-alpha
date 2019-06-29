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
      }
    };

    return {
      closeAllConnections,
      getAllPurchaseLedgerRows: async () => {
        const dbConnection = getMasterConnection();
        const { rows } = await dbConnection.raw(`
            select * from purchase_ledger
        `);

        return { purchaseLedgerRows: rows };
      }
    };
  }
};
