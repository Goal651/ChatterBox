import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

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
    const senderData = sessionStorage.getItem('currentUser') ;
    const from: string = JSON.parse(senderData!)._id
    const [myStream, setMyStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const { friendId } = useParams();
    const to = friendId
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        socket.emit('join', from); // Send join message to server

        socket.on('signal', (data) => {
            handleSignal(data);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setMyStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            })
            .catch((err) => console.error('Error accessing camera:', err));
    }, []);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const handleSignal = (data: SignalData) => {
        if (!peerConnectionRef.current) {
            peerConnectionRef.current = new RTCPeerConnection();
            peerConnectionRef.current.addEventListener('icecandidate', (event) => {
                if (event.candidate) {
                    socket.emit('signal', {
                        target: to,
                        type: 'candidate',
                        candidate: event.candidate,
                    });
                }
            });

            peerConnectionRef.current.addEventListener('track', (event) => {
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                }
            });

            if (myStream) {
                myStream.getTracks().forEach((track) => {
                    peerConnectionRef.current?.addTrack(track, myStream);
                });
            }
        }

        const peerConnection = peerConnectionRef.current;

        if (data.type === 'offer') {
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
                .then(() => peerConnection.createAnswer())
                .then((answer) => peerConnection.setLocalDescription(answer))
                .then(() => {
                    socket.emit('signal', {
                        target: to,
                        type: 'answer',
                        answer: peerConnection.localDescription,
                    });
                })
                .catch((error) => console.error('Error handling offer:', error));
        } else if (data.type === 'candidate') {
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
                .catch((error) => console.error('Error adding candidate:', error));
        } else if (data.type === 'answer') {
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
                .catch((error) => console.error('Error handling answer:', error));
        }
    };

    const handleCall = (peerIdToCall: string) => {
        if (!peerConnectionRef.current && myStream) {
            peerConnectionRef.current = new RTCPeerConnection();
            myStream.getTracks().forEach((track) => {
                peerConnectionRef.current?.addTrack(track, myStream);
            });

            peerConnectionRef.current.addEventListener('icecandidate', (event) => {
                if (event.candidate) {
                    socket.emit('signal', {
                        target: peerIdToCall,
                        type: 'candidate',
                        candidate: event.candidate,
                    });
                }
            });

            peerConnectionRef.current.addEventListener('track', (event) => {
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                }
            });

            peerConnectionRef.current.createOffer()
                .then((offer) => peerConnectionRef.current?.setLocalDescription(offer))
                .then(() => {
                    socket.emit('signal', {
                        target: peerIdToCall,
                        type: 'offer',
                        offer: peerConnectionRef.current?.localDescription,
                    });
                })
                .catch((error) => console.error('Error creating offer:', error));
        }
    };
    useEffect(() => {
        handleCall(to!);
    })


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
            <h1 className="text-4xl font-bold mb-4">Socket.io Video Call</h1>
            <p className="text-lg mb-6">My Peer ID: <span className="font-semibold">{from}</span></p>

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


        </div>
    );
}
