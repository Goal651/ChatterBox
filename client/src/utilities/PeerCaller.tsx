import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { User } from '../interfaces/interfaces';

interface PeerCallerProps {
    socket: Socket;
}

interface SignalData {
    type: string;
    offer: RTCSessionDescriptionInit;
    signal: RTCSessionDescriptionInit;
    peerId: string;
    receiver: string;
    candidate: RTCIceCandidateInit;
    target: string;
    room: string;
    answer: RTCSessionDescriptionInit;
}

export default function PeerCaller({ socket }: PeerCallerProps) {
    const senderData = sessionStorage.getItem('currentUser');
    const fromUser: User = JSON.parse(senderData || '{}');
    const from = fromUser?._id || '';
    const [myStream, setMyStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const { friendId } = useParams();
    const to = friendId;
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    // Initialize socket and join room
    useEffect(() => {
        if (!from) {
            console.error("No sender ID found. Check 'currentUser' in sessionStorage.");
            return;
        }

        console.log("Joining room:", from);
        socket.emit('join', from);

        socket.on('signal', (data) => {
            console.log("Received signal data:", data);
            handleSignal(data);
        });

        return () => {
            socket.off('signal');
        };
    }, [from, socket]);

    // Access and display the local video stream
    useEffect(() => {
        console.log("Requesting local media stream...");
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                console.log("Local stream acquired:", stream);
                setMyStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            })
            .catch((err) => console.error('Error accessing camera/microphone:', err));
    }, []);

    const handleSignal = (data: SignalData) => {
        if (!peerConnectionRef.current) {
            console.log("Initializing new RTCPeerConnection...");
            peerConnectionRef.current = new RTCPeerConnection();
            setupPeerConnectionEvents(peerConnectionRef.current);
        }

        const peerConnection = peerConnectionRef.current;

        if (data.type === 'offer') {
            console.log("Handling offer...");
            peerConnection
                .setRemoteDescription(new RTCSessionDescription(data.offer))
                .then(() => peerConnection.createAnswer())
                .then((answer) => peerConnection.setLocalDescription(answer))
                .then(() => {
                    console.log("Sending answer...");
                    socket.emit('signal', {
                        target: to,
                        type: 'answer',
                        answer: peerConnection.localDescription,
                    });
                })
                .catch((error) => console.error('Error handling offer:', error));
        } else if (data.type === 'candidate') {
            console.log("Adding ICE candidate...");
            peerConnection
                .addIceCandidate(new RTCIceCandidate(data.candidate))
                .catch((error) => console.error('Error adding ICE candidate:', error));
        } else if (data.type === 'answer') {
            console.log("Handling answer...");
            peerConnection
                .setRemoteDescription(new RTCSessionDescription(data.answer))
                .catch((error) => console.error('Error handling answer:', error));
        }
    };

    const setupPeerConnectionEvents = (peerConnection: RTCPeerConnection) => {
        peerConnection.addEventListener('icecandidate', (event) => {
            if (event.candidate) {
                console.log("Sending ICE candidate...");
                socket.emit('signal', {
                    target: to,
                    type: 'candidate',
                    candidate: event.candidate,
                });
            }
        });

        peerConnection.addEventListener('track', (event) => {
            if (event.streams && event.streams[0]) {
                console.log("Receiving remote stream...");
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }
        });

        if (myStream) {
            console.log("Adding local tracks to the peer connection...");
            myStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, myStream);
            });
        }
    };

    const handleCall = (peerIdToCall: string) => {
        if (!peerConnectionRef.current) {
            console.log("Initializing peer connection for call...");
            peerConnectionRef.current = new RTCPeerConnection();
            setupPeerConnectionEvents(peerConnectionRef.current);
        }

        const peerConnection = peerConnectionRef.current;

        console.log("Creating offer...");
        peerConnection
            .createOffer()
            .then((offer) => peerConnection.setLocalDescription(offer))
            .then(() => {
                console.log("Sending offer...");
                socket.emit('signal', {
                    target: peerIdToCall,
                    type: 'offer',
                    offer: peerConnection.localDescription,
                });
            })
            .catch((error) => console.error('Error creating offer:', error));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
            <h1 className="text-4xl font-bold mb-4">Socket.io Video Call</h1>
            <p className="text-lg mb-6">My Peer ID: <span className="font-semibold">{from}</span></p>

            <div className="flex flex-col items-center mb-8">
                <h3 className="text-xl font-semibold mb-2">Local Stream</h3>
                {myStream ? (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full max-w-xs rounded-lg shadow-lg border-2 border-gray-300"
                    />
                ) : (
                    <p>Loading local stream...</p>
                )}
            </div>

            <div className="flex flex-col items-center mb-8">
                <h3 className="text-xl font-semibold mb-2">Remote Stream</h3>
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-xs rounded-lg shadow-lg border-2 border-gray-300"
                    />
                ) : (
                    <p>Waiting for remote stream...</p>
                )}
            </div>
        </div>
    );
}
