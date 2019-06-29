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

    return moment().isBetween(accountStartDate, accountEndDate, null, '[]');
  },
  getBuyAmountInDollarsForConfig: function({ buyConfig }) {
    // we assume one buy per minute
    const {
      [BUY_CONFIG_MAP.ACCOUNT_START_DATE]: accountStartDate,
      [BUY_CONFIG_MAP.ACCOUNT_END_DATE]: accountEndDate,
      [BUY_CONFIG_MAP.AMOUNT_INVESTED]: amountInvested
    } = buyConfig;

    const startDate = moment(accountStartDate);
    const endDate = moment(accountEndDate);
    const numberOfDays = endDate.diff(startDate, 'days') + 1;
    const numberOfMinutes = 1440 * numberOfDays;

    const amountToBuyInDollars = amountInvested / numberOfMinutes;

    return { amountToBuyInDollars };
  }
};
