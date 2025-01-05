import { useState } from "react";

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

const sampleNotifications: Notification[] = [
    {
        id: "1",
        title: "Welcome!",
        message: "Thanks for joining us. Explore the features now!",
        timestamp: "2025-01-05T10:30:00Z",
        read: false,
    },
    {
        id: "2",
        title: "Group Created",
        message: "Your new group 'React Developers' has been created.",
        timestamp: "2025-01-04T15:45:00Z",
        read: true,
    },
    {
        id: "3",
        title: "New Message",
        message: "You have a new message from John Doe.",
        timestamp: "2025-01-03T08:20:00Z",
        read: false,
    },
];

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

    const markAsRead = (id: string) => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications((prevNotifications) =>
            prevNotifications.filter((notification) => notification.id !== id)
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-gray-300 mb-4">Notifications</h1>
            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`flex justify-between items-center p-4 rounded-lg shadow-md border ${notification.read ? "bg-slate-700" : "bg-blue-900 border-blue-500"
                                }`}
                        >
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold text-gray-200">{notification.title}</h2>
                                <p className="text-sm text-gray-400">{notification.message}</p>
                                <span className="text-xs text-gray-500">
                                    {new Date(notification.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex space-x-3">
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center">No notifications to display.</p>
                )}
            </div>
        </div>
    );
}
