'use strict';
module.exports.main = async (event, context, callback) => {
    try {
        console.log('I AM DOING SOMETHING');
    } catch (error) {
        console.log('Error during lambda execution', {error});
        callback(error);
    }
};
