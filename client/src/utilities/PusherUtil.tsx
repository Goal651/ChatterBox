import { useEffect } from "react";
import pusher from "../config/PusherConfig";

const PusherUtil = () => {
    useEffect(() => {
        // Request permission for browser notifications
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const channel = pusher.subscribe('my-channel');

        channel.bind('test', (data: { title: string; message: string }) => {
            console.log('Received data:', data);

            // Show a browser notification
            if (Notification.permission === "granted") {
                new Notification(data.title, {
                    body: data.message,
                    icon: "/notification-icon.png", // Optional: Path to an icon
                });
            }
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);

    return null;
};

export default PusherUtil;
