const Pusher = require('pusher');

const pusher = new Pusher({
  appId: 'YOUR_APP_ID',
  key: 'YOUR_APP_KEY',
  secret: 'YOUR_APP_SECRET',
  cluster: 'YOUR_APP_CLUSTER',
  useTLS: true
});

// Use Pusher to send a notification when the user is offline
const sendPushNotification = (userId, message) => {
  pusher.trigger('notifications-channel', 'new-notification', {
    userId: userId,
    message: message
  });
};
