import { useEffect } from 'react';
import { subscribeToPush } from '../api/api';
import { vapidKey } from '../constants/constant';

const PushNotifications = () => {
    useEffect(() => {
        async function setupPushNotifications() {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    const subscription = await subscribeUserToPush(registration);
                    if (subscription) {
                        await subscribeToPush(subscription);
                    }
                } catch (error) {
                    console.error('Failed to set up push notifications:', error);
                }
            }
        }
        setupPushNotifications();
    }, []);

    const subscribeUserToPush = async (registration: ServiceWorkerRegistration) => {
        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });
            return subscription;
        } catch (error) {
            console.error('Error subscribing to push:', error);
            return null;
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
    };

    return null;
};

export default PushNotifications;
