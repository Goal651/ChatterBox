import Pusher from 'pusher-js';

const pusher = new Pusher('31d878acaf1b97438d21', {
    cluster: 'ap2',
});

export default pusher;
