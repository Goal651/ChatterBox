import { User } from "../interfaces/interfaces";

interface NotifierProps {
    from: string
    message: string
    users: User[]
}

export default function Notifier(data: NotifierProps) {

    const { from, message ,users} = data

    const user = users.find((user) => user.username === from);


    Notification.requestPermission().then((result) => {
        if (result === 'granted') {
            new Notification('You have a new message', {
                body: user?.username||'Unknown User' + ':' + message,
                icon: '/AppIcon.png',
            });
        } else if (result === 'denied') {
            console.log('Notification permission denied');
        } else if (result === 'default') {
            console.log('Notification permission default');
        }
    });
}