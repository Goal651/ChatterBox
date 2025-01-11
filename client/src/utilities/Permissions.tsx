import React, { useState, useEffect } from 'react';

const NotificationRequest: React.FC = () => {
    const [permission, setPermission] = useState<NotificationPermission | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Check if notifications are supported and set initial permission status
        if ('Notification' in window) {
            const currentPermission = Notification.permission;
            console.log('Notification API supported');
            console.log('Current Notification Permission:', currentPermission);
            setPermission(currentPermission);
            if (currentPermission === 'default') {
                setShowModal(true);
            }
        } else {
            console.log('Notifications are not supported in this browser.');
            setShowModal(false);
        }
    }, []);

    const requestPermission = async () => {
        console.log('Requesting notification permission...');
        if (permission === 'default') {
            await Notification.requestPermission()
                .then((result) => {
                    console.log('Notification Permission Result:', result);
                    setPermission(result);
                    if (result === 'granted') {
                        console.log('Notification permission granted');
                        new Notification('Test Notification', { body: 'This is a test notification.' });
                    } else if (result === 'denied') {
                        console.log('Notification permission denied');
                    }
                })
                .catch((error) => {
                    console.error('Error requesting notification permission:', error);
                });
        }
    };

    if (!showModal) return null;

    return (
        <div className="fixed top-0 left-0 w-screen flex items-center justify-center h-screen bg-black bg-opacity-80 z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center w-80 text-slate-300">
                <h2 className="text-xl font-semibold mb-4">Enable Notifications</h2>
                <p className="mb-4">
                    We would like to send you notifications for important updates.
                </p>
                {permission === 'denied' ? (
                    <>
                        <p className="text-red-500 mb-4">Notifications are blocked. You can enable them in browser settings.</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                            Close
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            console.log('Allow Notifications button clicked');
                            requestPermission();
                        }}
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
