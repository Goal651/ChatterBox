import { User } from "../interfaces/interfaces";

interface NotifierProps {
    from: string
    message: string
    users: User[]
}

export default function Notifier(data: NotifierProps) {
    const { from, message } = data
    Notification.requestPermission().then((result) => {
        if (result === 'granted') {
            new Notification('You have a new message', {
                body: from + ':' + message,
                icon: '/AppIcon.png',
            });
        } else if (result === 'denied') {
            console.log('Notification permission denied');
        } else if (result === 'default') {
            console.log('Notification permission default');
        }
    });
}