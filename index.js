'use strict';
const airtableLib = require('./lib/airtable');
const strategyHelperLib = require('./lib/strategy_helper');
const slackerLib = require('./lib/slacker');
const dbLib = require('./lib/db');
const coinbase = require('./lib/coinbase');

const dbManager = dbLib.getDBManager();

const R = require('ramda');

async function processActiveConfig({ config }) {
  console.log('Working on the following config', { config });

  const configId = config[airtableLib.CONSTANTS.BUY_CONFIG_MAP.CONFIG_ID];
  const productId = config[airtableLib.CONSTANTS.BUY_CONFIG_MAP.PRODUCT_ID];
  const gdaxKey = config[airtableLib.CONSTANTS.BUY_CONFIG_MAP.GDAX_API_KEY];
  const gdaxSecret = config[airtableLib.CONSTANTS.BUY_CONFIG_MAP.GDAX_SECRET];
  const gdaxPassphrase = config[airtableLib.CONSTANTS.BUY_CONFIG_MAP.GDAX_PASSWORD];

  const { amountSpent } = await dbManager.getAmountSpentForConfigId({ configId });

  const { amountToBuyInDollars } = strategyHelperLib.getBuyAmountInDollarsForConfig({
    buyConfig: config,
    amountSpent
  });

  const { currentPriceOfProduct } = await coinbase.getCurrentPriceOfProduct({ productId });

  let cryptoPurchased = 0;
  if (amountToBuyInDollars > 0) {
    ({ cryptoPurchased } = await coinbase.buyProduct({
      productId,
      purchaseAmount: amountToBuyInDollars,
      gdaxKey,
      gdaxSecret,
      gdaxPassphrase
    }));
  }

  await dbManager.saveTransaction({
    configId,
    dollarsUsedToBuy: amountToBuyInDollars,
    amountOfCryptoPurchased: cryptoPurchased,
    productId,
    succeeded: true,
    currentPriceOfProduct
  });

  await slackerLib.reportPurchasesToSlack({
    purchases: { config, amountSpent, amountToBuyInDollars }
  });
}

async function getAllActiveConfigs() {
  const { allBuyConfigs } = await airtableLib.getAllBuyConfigs();

  const activeConfigs = R.filter(
    buyConfig => strategyHelperLib.isConfigActive({ buyConfig }),
    allBuyConfigs
  );

  return { activeConfigs };
}

module.exports.main = async () => {
  try {
    console.log('Starting execution...');
    const { activeConfigs } = await getAllActiveConfigs();
    console.log('Working on configs: ', { activeConfigs });
    for (const config of activeConfigs) {
      try {
        await processActiveConfig({ config });
      } catch (error) {
        console.log('Error during config execution', { error, config });
        await slackerLib.reportErrorToSlack({
          error: { message: 'Error while processing config', config, error }
        });
      }
    }
  } catch (error) {
    console.log('Error during lambda execution', { error });
    await slackerLib.reportErrorToSlack({ error });
  } finally {
    await dbManager.closeAllConnections();
  }
};
