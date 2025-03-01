import webPush from 'web-push';

const privateKey = process.env.PRIVATE_KEY || '';
const publicKey = process.env.PUBLIC_KEY || '';

if (!privateKey || !publicKey) {
    throw new Error('VAPID keys are missing. Please set PRIVATE_KEY and PUBLIC_KEY in your environment variables.');
}

webPush.setVapidDetails('mailto:wigothehacker@gmail.com', publicKey, privateKey);

export default webPush;
