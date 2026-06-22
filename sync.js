const { Notification } = require('./src/models');

async function syncDb() {
  try {
    await Notification.sync({ alter: true });
    console.log('Notification table synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing Notification table:', error);
    process.exit(1);
  }
}

syncDb();
