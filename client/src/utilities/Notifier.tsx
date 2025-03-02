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
       }
    });
}