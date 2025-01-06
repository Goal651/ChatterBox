import Peer from "peerjs";

export default function PeerConfig() {
    const peer = new Peer('client', {
        host: 'localhost',
        port: 3000,
        path: '/',
    })
    peer.on('open', (id) => {
        console.log('Peer ID:', id);
    })

    return peer
}