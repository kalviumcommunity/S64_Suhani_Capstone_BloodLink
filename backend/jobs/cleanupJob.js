const cron = require('node-cron');
const { cleanupExpiredNotifications } = require('../controller/notifyController');

// Setup cron job to run daily at midnight to clean up expired notifications
const setupCleanupJob = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running notification cleanup job...');
    try {
      const result = await cleanupExpiredNotifications();
      console.log(`Cleanup job completed. Removed ${result.deletedCount} expired notifications.`);
    } catch (error) {
      console.error('Cleanup job failed:', error);
    }
  });
  
  // Also run every hour to clean up any notifications that may have been missed
  cron.schedule('0 * * * *', async () => {
    console.log('Running hourly notification cleanup check...');
    try {
      await cleanupExpiredNotifications();
    } catch (error) {
      console.error('Hourly cleanup check failed:', error);
    }
  });
  
  console.log('Notification cleanup jobs scheduled');
};

module.exports = { setupCleanupJob };