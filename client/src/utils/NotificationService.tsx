type NotificationType = "success" | "error" | "info" | "warning";

let showNotification: (msg: string, type: NotificationType) => void;

export const setNotificationHandler = (
    handler: (msg: string, type: NotificationType) => void
) => {
    showNotification = handler;
};

export const notify = (message: string, type: NotificationType = "info") => {
    if (showNotification) {
        showNotification(message, type);
    } else {
        console.warn("Notification handler not set.");
    }
};
