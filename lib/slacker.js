const axios = require('axios');

module.exports = {
  reportPurchasesToSlack: async ({ purchases }) => {
    const currentTime = new Date().toTimeString();

    await axios.post(process.env.SLACK_PURCHASES_REPORTING_URL, {
      text: [
        `HODL BOT RUNNING @ ${currentTime}`,
        'Purchases Below',
        JSON.stringify(purchases, null, 4)
      ].join('\n')
    });
  },

  reportErrorToSlack: async ({ error }) => {
    const currentTime = new Date().toTimeString();

    await axios.post(process.env.SLACK_ERROR_REPORTING_URL, {
      text: [
        `HODL BOT RUNNING @ ${currentTime}`,
        'SOME ERROR OCCURRED',
        JSON.stringify(error, null, 4)
      ].join('\n')
    });
  }
};
