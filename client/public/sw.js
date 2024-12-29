self.addEventListener('push', (event) => {
    console.log('Push event received:', event);

    // Extract the data from the event
    const data = event.data.json();
    const options = {
        body: data.message,
        icon: '/notification-icon.png', // Path to notification icon
        badge: '/badge-icon.png', // Path to badge icon
        data: { url: data.url }, // Pass data for click handling
    };

    // Show the notification
    self.registration.showNotification(data.title, options);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const notificationData = event.notification.data;

    if (notificationData && notificationData.url) {
        // Open the URL associated with the notification
        event.waitUntil(clients.openWindow(notificationData.url));
    }
});
