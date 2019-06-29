const dotenv = require('dotenv');

dotenv.config();

const defaultConfig = {
  client: 'pg',
  connection: {
    host: process.env.PSQL_HOST,
    user: process.env.PSQL_USER,
    password: process.env.PSQL_PASSWORD,
    database: process.env.PSQL_DATABASE,
    charset: 'utf8'
  },
  pool: {
    min: process.env.MIN_DB_CONNECTIONS || 2,
    max: process.env.MAX_DB_CONNECTIONS || 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};

module.exports = {
  test: defaultConfig,
  local: defaultConfig,
  development: defaultConfig,
  production: defaultConfig
};