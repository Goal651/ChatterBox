import Peer from "peerjs";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";


export default function PeerCaller({ serverUrl }: { serverUrl: string }) {
    const userId = localStorage.getItem('userId')
    const from = JSON.parse(userId!)._id
    const [peer, setPeer] = useState<Peer | null>(null)
    const [myStream, setMyStream] = useState<MediaStream | null>(null)
    const [peerId, setPeerId] = useState('')
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const { friendId } = useParams();

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const newPeer = new Peer(from, {
            path: '/testing',
            host: serverUrl,
            port: 3000,
            secure: false,
        })

        newPeer.on('open', (id) => {
            setPeerId(id)
            console.log('Peer ID: ', id)
        })

        newPeer.on('call', (call) => {
            if (myStream) {
                call.answer(myStream)
                call.on('stream', (remoteStream) => {
                    setRemoteStream(remoteStream);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                    }
                })
            }
        })

        newPeer.on('error', (err) => {
            console.error('PeerJS error:', err);
        });

        setPeer(newPeer)
        return () => {
            if (newPeer) newPeer.destroy()
        }
    }, [myStream])

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setMyStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            })
            .catch((err) => console.error("Error accessing camera:", err))
    }, [])

    const handleCall = (peerIdToCall: string) => {
        if (peer && myStream) {
            const call = peer.call(peerIdToCall, myStream)
            call.on('stream', (remoteStream) => {
                setRemoteStream(remoteStream);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            })
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
            <h1 className="text-4xl font-bold mb-4">PeerJS with React and TypeScript</h1>
            <p className="text-lg mb-6">My Peer ID: <span className="font-semibold">{peerId}</span></p>

            <div className="flex flex-col items-center mb-8">
                <h3 className="text-xl font-semibold mb-2">Local Stream</h3>
                {myStream && (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full max-w-xs rounded-lg shadow-lg border-2 border-gray-300"
                    />
                )}
            </div>

            <div className="flex flex-col items-center mb-8">
                <h3 className="text-xl font-semibold mb-2">Remote Stream</h3>
                {remoteStream && (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-xs rounded-lg shadow-lg border-2 border-gray-300"
                    />
                )}
            </div>

            <div className="flex flex-col items-center">
                <button
                    onClick={() => handleCall(friendId!)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
                >
                    Call Peer
                </button>
            </div>
        </div>
    )
}
