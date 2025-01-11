import React, { useState, useEffect } from 'react';

const NotificationRequest: React.FC = () => {
    const [permission, setPermission] = useState<NotificationPermission | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setPermission(Notification.permission);
        console.log(Notification.permission)
        if (Notification.permission === 'default' || Notification.permission === 'denied') {
            setShowModal(true);
        } else setShowModal(false)
    }, []);

    const requestPermission = async () => {
        const permission = await Notification.requestPermission();
        setPermission(permission);
        setShowModal(false);
    };

    const openSettings = () => {
        if (navigator.userAgent.includes('Chrome')) {
            // For Chrome, we could guide users to settings manually
            window.location.href = 'chrome://settings/content/notifications'
        } else if (navigator.userAgent.includes('Firefox')) {
            // For Firefox
            window.location.href = 'about:preferences#notifications'
        } else {
            alert("Please manually enable notifications in your browser settings.");
        }

    };
    if (!showModal) return null

    return (
        <div className="fixed top-0 left-0 w-screen flex items-center justify-center h-screen bg-black bg-opacity-80 z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center w-80 *:text-slate-300">
                <h2 className="text-xl font-semibold mb-4">Enable Notifications</h2>
                <p className="mb-4">
                    We would like to send you notifications for important updates.
                </p>
                {permission === 'denied' ? (
                    <>
                        <p className="text-red-500 mb-4">Notifications are blocked. You can enable them in browser settings.</p>
                        <button
                            onClick={openSettings}
                            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                            Go to Settings
                        </button>
                    </>
                ) : (
                    <button
                        onClick={requestPermission}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Allow Notifications
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationRequest;
