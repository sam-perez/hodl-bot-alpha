'use strict';
const axios = require('axios');

module.exports.main = async (event, context, callback) => {
  try {
    const currentTime = new Date().toTimeString();

    await axios.post(process.env.SLACK_POST_URL, { text: `HODL BOT RUNNING @ ${currentTime}` });
  } catch (error) {
    console.log('Error during lambda execution', { error });
    callback(error);
  }
};
