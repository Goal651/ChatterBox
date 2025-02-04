import { useState } from "react";
import { Notification } from "../interfaces/interfaces";



export default function Notifications(data: { notification: Notification[] }) {
    const [notifications, setNotifications] = useState<Notification[]>(data.notification);

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
        <div className="w-full  mx-auto p-6 bg-slate-950 rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold text-gray-300 mb-5 text-center">Notifications</h1>
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
