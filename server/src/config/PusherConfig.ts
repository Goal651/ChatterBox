import Pusher from 'pusher';

const pusher = new Pusher({
    appId: "1916140",
    key: "31d878acaf1b97438d21",
    secret: "de24324d9793de551e20",
    cluster: "ap2",
    useTLS: true
});

export default pusher;
