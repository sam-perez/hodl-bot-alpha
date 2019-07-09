const airtableLib = require('./airtable');
const moment = require('moment');

const {
  CONSTANTS: { BUY_CONFIG_MAP }
} = airtableLib;

// this is set by GDAX and is actually currency dependent
const MIN_BUY_AMOUNT_IN_DOLLARS = 10.0;
const BOT_WAKEUP_CADENCE_IN_SECONDS = 60;

module.exports = {
  isConfigActive: function({ buyConfig }) {
    const {
      [BUY_CONFIG_MAP.ACCOUNT_START_DATE]: accountStartDate,
      [BUY_CONFIG_MAP.ACCOUNT_END_DATE]: accountEndDate
    } = buyConfig;

    // refer to docs, but '[]' means inclusive between
    const now = moment();
    const isActive = now.isBetween(
      moment(accountStartDate),
      moment(accountEndDate),
      'day',
      '[]'
    );
    return isActive;
  },
  getBuyAmountInDollarsForConfig: function({ buyConfig, amountSpent, lastPurchaseDate }) {
    // we assume one buy per minute
    const {
      [BUY_CONFIG_MAP.ACCOUNT_END_DATE]: accountEndDate,
      [BUY_CONFIG_MAP.AMOUNT_INVESTED]: amountInvested
    } = buyConfig;

    const now = moment();
    // add one day to end date to capture the hours in the end date
    const endDate = moment(accountEndDate).add(1, 'day');
    // we want to round down to the nearest cent
    // numberz in javascript are hardddd. beware of bullshite rounding errors
    // what is 400 - 385.12? 14.879999999999995!!!! look into dinero.js
    const amountLeftToBuy =
            (Math.floor(100 * amountInvested) - Math.floor(100 * amountSpent)) / 100;

    const lastBuyMoment =
            lastPurchaseDate === null
              ? null
              : // shift this by half the cadence to ensure we cross over the minute mark each time
            // don't mess with baundaries, moment.diff is in whole minutes
              moment(lastPurchaseDate).add(
                (-1 * BOT_WAKEUP_CADENCE_IN_SECONDS) / 2,
                'seconds'
              );

    // this is the number of whole minutes that have past
    const minutesSinceLastBuy =
            lastPurchaseDate === null ? null : now.diff(lastBuyMoment, 'minutes');

    const numberOfMinutesLeft = Math.max(endDate.diff(lastBuyMoment || now, 'minutes'), 1);
    const amountToBuyPerMinute = amountLeftToBuy / numberOfMinutesLeft;

    const theoreticalAmountToBuy =
            lastPurchaseDate === null
              ? MIN_BUY_AMOUNT_IN_DOLLARS
              : Math.min(minutesSinceLastBuy * amountToBuyPerMinute, amountLeftToBuy);

    let amountToBuyInDollars;
    if (theoreticalAmountToBuy >= MIN_BUY_AMOUNT_IN_DOLLARS) {
      const amountLeftOverAfterThisBuy = amountLeftToBuy - theoreticalAmountToBuy;
      if (amountLeftOverAfterThisBuy < MIN_BUY_AMOUNT_IN_DOLLARS) {
        amountToBuyInDollars = amountLeftToBuy;
      } else {
        amountToBuyInDollars = Math.floor(100 * theoreticalAmountToBuy) / 100;
      }
    } else {
      amountToBuyInDollars = 0;
    }

    const debugData = {
      lastPurchaseDate,
      accountEndDate,
      minutesSinceLastBuy,
      amountLeftToBuy,
      theoreticalAmountToBuy,
      amountToBuyInDollars,
      amountToBuyPerMinute,
      amountSpent,
      numberOfMinutesLeft
    };

    return { amountToBuyInDollars, debugData };
  }
};
