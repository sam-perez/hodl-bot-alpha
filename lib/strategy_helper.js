const airtableLib = require('./airtable');
const moment = require('moment');

const {
  CONSTANTS: { BUY_CONFIG_MAP }
} = airtableLib;

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
  getBuyAmountInDollarsForConfig: function({ buyConfig, amountSpent }) {
    // we assume one buy per minute
    const {
      [BUY_CONFIG_MAP.ACCOUNT_END_DATE]: accountEndDate,
      [BUY_CONFIG_MAP.AMOUNT_INVESTED]: amountInvested
    } = buyConfig;

    const now = moment();
    // add one day to end date to capture the hours in the end date
    const endDate = moment(accountEndDate).add(1, 'day');
    const numberOfMinutesLeft = endDate.diff(now, 'minutes');

    // we want to round down to the nearest cent
    const amountLeftToBuy = amountInvested - amountSpent;
    const amountToBuyInDollars =
            Math.floor((100 * amountLeftToBuy) / numberOfMinutesLeft) / 100;

    return { amountToBuyInDollars };
  }
};
