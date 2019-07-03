const Airtable = require('airtable');
const R = require('ramda');

module.exports = {
  CONSTANTS: {
    BUY_CONFIG_MAP: {
      ACCOUNT_NAME: 'Name',
      ACCOUNT_START_DATE: 'Account Start Date',
      ACCOUNT_END_DATE: 'Account End Date',
      AMOUNT_INVESTED: 'Amount Invested',
      CONFIG_ID: 'Config Id',
      PRODUCT_ID: 'Product Id',
      GDAX_API_KEY: 'GDAX API Key',
      GDAX_PASSWORD: 'GDAX Password',
      GDAX_SECRET: 'GDAX Secret',
      NOTES: 'Notes'
    }
  },
  getAllBuyConfigs: async function() {
    return new Promise((resolve, reject) => {
      const accountConfigsBase = new Airtable({
        apiKey: process.env['AIRTABLE_API_KEY']
      }).base(process.env['AIRTABLE_CONFIG_BASE_ID']);

      let allBuyConfigs = [];

      accountConfigsBase(`Account Configs${process.env.MY_STAGE === 'dev' ? ' - Dev' : ''}`)
        .select({
          maxRecords: 100,
          view: 'Main'
        })
        .eachPage(
          function page(records, fetchNextPage) {
            allBuyConfigs = R.concat(allBuyConfigs, R.map(r => r.fields, records));

            // To fetch the next page of records, call `fetchNextPage`.
            // If there are more records, `page` will get called again.
            // If there are no more records, `done` will get called.
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              reject({ airtableError: err, context: { allBuyConfigs } });
            } else {
              resolve({ allBuyConfigs });
            }
          }
        );
    });
  }
};
