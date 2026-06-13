const cron = require('node-cron');
const { fetchAndUpdateData } = require('./dataFetcher');

const initCronJobs = () => {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        console.log('Running scheduled cron job...');
        fetchAndUpdateData();
    });

    // Run immediately on backend server startup so we have fresh metrics right away
    fetchAndUpdateData();
};

module.exports = initCronJobs;