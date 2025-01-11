const { title } = require("process");

// Listen for the push event
self.addEventListener('push', (event) => {
    const data = event.data.json();

    const options = {
        body: data.message,
        icon: '/AppIcon.png',
        data: { url: data.url },
        title: 'ChatterBox',
    };

    event.waitUntil(
        self.registration.showNotification(options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notificationData = event.notification.data;
    if (notificationData && notificationData.url) {
        event.waitUntil(clients.openWindow(notificationData.url));
    }
});
