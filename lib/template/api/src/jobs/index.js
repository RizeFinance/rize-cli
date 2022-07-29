const Cron = require('node-cron');

const Rize = require('@rizefinance/rize-js');
const config = require('../config/config.js');
const rizeProvider = new Rize(config.rize.programId, config.rize.apiSecret, { environment: config.rize.environment });
const dbProvider = require('../providers/db')(config.database, false);
const syncTransactions = require('./syncTransactions');

exports.initScheduledJobs = () => {
    console.log('skipping jobs');
    // try {
    //     const scheduledSyncTransactions = Cron.schedule('* * */8 * * *', () => syncTransactions(rizeProvider, dbProvider));
    //     scheduledSyncTransactions.start();
    // } catch (err) {
    //     console.error(err);
    // }
};