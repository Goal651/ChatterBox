import { useEffect } from 'react';
import { subscribeToPush } from '../api/api';

const PushNotifications = ({serverUrl}:{serverUrl: string}) => {
    useEffect(() => {
        async function setupPushNotifications() {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                const registration = await navigator.serviceWorker.register('/sw.js');
                const subscription = await subscribeUserToPush(registration);
                try {
                    await subscribeToPush(serverUrl,subscription || {});
                } catch (error) {
                    console.error('Failed to send subscription to the backend:', error);
                }
            }
        }
        setupPushNotifications();
    }, []);

    const subscribeUserToPush = async (registration: ServiceWorkerRegistration) => {
        try {
            const publicVapidKey = 'BEFnyePPNoUMVOxzMQDy2J8OBmq7AHnks8vNchYeVcMrNOC21ZSuXqfl04fs6DPmUIBTgP9olyKehQgpfZcTqJ0';
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });
            
            return subscription;
        } catch (error) {
            console.error('Error subscribing to push:', error);
        }
    };


    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
    };

    return null
};

export default PushNotifications;
