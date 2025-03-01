import { User } from "../interfaces/interfaces";

interface NotifierProps {
    from: string
    message: string
    users: User[],
    title: string
}

export default function Notifier(data: NotifierProps) {
    const { from, message } = data
    Notification.requestPermission().then((result) => {
        if (result === 'granted') {
            const notification = new Notification(data.title,
                {
                    body: from + ':' + message,
                    icon: '/AppIcon.png',
                },
            )
            notification.onclick = () => window.focus();
       } else if (result === 'denied') {
            console.log('Notification permission denied');
        } else if (result === 'default') {
            console.log('Notification permission default');
        }
    });
}