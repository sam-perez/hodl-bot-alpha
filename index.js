'use strict';
//const axios = require('axios');
//await axios.post(process.env.SLACK_POST_URL, { text: `HODL BOT RUNNING @ ${currentTime}` });
const airtableLib = require('./lib/airtable');
const strategyHelperLib = require('./lib/strategy_helper');
const R = require('ramda');

module.exports.main = async (event, context, callback) => {
  try {
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
    }
  } catch (error) {
    console.log('Error during lambda execution', { error });
    callback(error);
  }
};
