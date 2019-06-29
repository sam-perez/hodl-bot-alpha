'use strict';
const airtableLib = require('./lib/airtable');
const strategyHelperLib = require('./lib/strategy_helper');
const slackerLib = require('./lib/slacker');
const dbLib = require('./lib/db');

const R = require('ramda');

module.exports.main = async (event, context, callback) => {
  const dbManager = dbLib.getDBManager();

  try {
    const { purchaseLedgerRows } = await dbManager.getAllPurchaseLedgerRows();

    console.log({ purchaseLedgerRows });

    const { allBuyConfigs } = await airtableLib.getAllBuyConfigs();

    const activeConfigs = R.filter(
      buyConfig => strategyHelperLib.isConfigActive({ buyConfig }),
      allBuyConfigs
    );

    console.log({ activeConfigs });

    for (const buyConfig of activeConfigs) {
      console.log('Working on the following config', { buyConfig });

      const { amountToBuyInDollars } = strategyHelperLib.getBuyAmountInDollarsForConfig({
        buyConfig
      });

      console.log({ amountToBuyInDollars });

      await slackerLib.reportPurchasesToSlack({
        purchases: { activeConfigs, amountToBuyInDollars, purchaseLedgerRows }
      });
    }
  } catch (error) {
    console.log('Error during lambda execution', { error });
    await slackerLib.reportErrorToSlack({ error });
  } finally {
    await dbManager.closeAllConnections();
  }

  callback();
};
