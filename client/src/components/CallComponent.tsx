import React, { useEffect, useRef, useState } from "react";
import { User } from "../interfaces/interfaces";
import { Socket } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";

interface CallComponentProps {
    users: User[];
    socket: Socket;
    isVideoCall: boolean;
    isUserCalling: boolean;
    onCancel: () => void;
    isOutgoingCall: boolean;
    isIngoingCall: boolean;
    callEnded: () => void;
}

const CallComponent: React.FC<CallComponentProps> = ({ users, isVideoCall, socket, onCancel, isOutgoingCall }) => {
    const [isCallAccepted, setIsCallAccepted] = useState(false);
    const [isUserCalling, setIsUserCalling] = useState(false)
    const [isUserBeingCalled, setIsUserBeingCalled] = useState(false);
    const [isUserCallAccepted, setIsUserCallAccepted] = useState(false)
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
    const [callingUser, setCallingUser] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const { friendId } = useParams()
    const navigate = useNavigate()


    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);


    useEffect(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
    }, [localStream, remoteStream])

    useEffect(() => {
        const userData = users.find((user) => user._id === friendId);
        if (userData) setCallingUser(userData.username);
    }, [users, friendId]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCallDuration(callDuration + 1)
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOutgoingCall) {
            setIsUserCalling(true)
            setShowModal(true)
        }
    }, [isOutgoingCall])

    useEffect(() => {
        setIsUserCalling(false)
        setCallingUser('')
        setRemoteStream(null)
        setPeerConnection(null)
        setOffer(null)
        setIsCallAccepted(false)
    }, [navigate])

    // Initiate Outgoing Call
    useEffect(() => {
        const startCall = async () => {
            try {
                if (!socket || !isOutgoingCall) return;
                const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true });
                setLocalStream(stream);
                const pc = new RTCPeerConnection();
                setPeerConnection(pc);
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("iceCandidate", { candidate: event.candidate, to: friendId });
                    }
                };
                pc.ontrack = (event) => {
                    const [remoteStream] = event.streams;
                    setRemoteStream(remoteStream);
                };
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("startCall", { offer, receiverId: friendId, isVideoCall: isVideoCall });
            } catch (error) {
                console.error(error);

                localStream?.getTracks().forEach((track) => track.stop());
                remoteStream?.getTracks().forEach((track) => track.stop());
                onCancel();
            }
        };
        startCall();
    }, [isUserCalling]);

    useEffect(() => {
        const handleIncomingCall = (data: { callerId: string; offer: RTCSessionDescriptionInit }) => {
            setIsUserBeingCalled(true);
            setCallingUser(data.callerId);
            setOffer(data.offer);
            setShowModal(true)
        };

        const handleCallCancelled = () => {
            setIsUserBeingCalled(false);
            setCallingUser(null);
            setOffer(null);
            onCancel();
            setShowModal(false);
            localStream?.getTracks().forEach((track) => track.stop());
            remoteStream?.getTracks().forEach((track) => track.stop());
        };

        const handleIceCandidate = (data: { candidate: RTCIceCandidateInit }) => {
            if (peerConnection) {
                peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        };

        const handleCallFailed = () => { setIsUserCalling(false); }


        socket.on("incomingCall", handleIncomingCall);
        socket.on("callCancelled", handleCallCancelled);
        socket.on("iceCandidate", handleIceCandidate);
        socket.on("call_failed", handleCallFailed);
        socket.on("callAccepted", (data: { answer: RTCSessionDescriptionInit }) => {
            setIsUserCallAccepted(true);
            if (peerConnection) peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        return () => {
            socket.off("incomingCall", handleIncomingCall);
            socket.off("callCancelled", handleCallCancelled);
            socket.off("iceCandidate", handleIceCandidate);
            socket.off("call_failed");
            socket.off("callAccepted");
        };
    }, [socket, peerConnection]);

    const handleAccept = async () => {
        try {
            setIsCallAccepted(true);
            const pc = new RTCPeerConnection();
            setPeerConnection(pc);

            const localStream = await navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true });
            setLocalStream(localStream);
            localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("iceCandidate", { candidate: event.candidate, to: callingUser });
                }
            };

            pc.ontrack = (event) => {
                const [remoteStream] = event.streams;
                setRemoteStream(remoteStream);
            };

            if (offer) {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("acceptCall", { answer, callerId: callingUser });
            }
        } catch (error) {
            console.error("Error accepting call:", error);

        }
    };

    const handleDecline = () => {
        setIsCallAccepted(false)
        setIsUserBeingCalled(false);
        setShowModal(false);

        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
        }
        onCancel();
        socket.emit("callDeclined", { callerId: callingUser });
    };

    const handleCancelCall = () => {
        setShowModal(false);

        setIsUserCalling(false);
        onCancel();
        socket.emit("callCancelled", { receiverId: friendId });
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 h-screen overflow-hidden">
            {isOutgoingCall && (
                <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-lg text-center animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isUserCallAccepted ? (
                            <>In call With {callingUser}</>
                        ) : (
                            <>Calling {callingUser}...</>
                        )}
                    </h2>
                    {isVideoCall ? (
                        <div className="flex w-96 h-96 mx-auto mb-6 items-center justify-evenly">
                            <div className="w-2/4 h-2/4">
                                <video
                                    muted
                                    ref={localVideoRef}
                                    controls={false}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full rounded-full object-cover bg-black border border-gray-600 shadow-md"
                                />
                            </div>
                            <div className="w-3/4 h-full">
                                {remoteStream ? (
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full rounded-lg object-cover bg-black border border-gray-600 shadow-md"
                                    />
                                ) : (
                                    <div className="bg-black w-full h-full rounded-box flex items-center justify-center border border-gray-600">
                                        <span className="text-gray-500">Waiting for connection...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-700 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center text-3xl text-green-400 animate-pulse">
                            📞
                        </div>
                    )}

                    <button
                        onClick={handleCancelCall}
                        className="bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        Cancel Call
                    </button>
                </div>
            )}

            {isUserBeingCalled && !isCallAccepted && (
                <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-sm text-center animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-2">Incoming Call</h2>
                    <p className="text-gray-400 mb-6">{callingUser}</p>
                    <div className="bg-gray-700 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center text-3xl text-green-400 animate-pulse">
                        {isVideoCall ? "📹" : "📞"}
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleAccept}
                            className="bg-green-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-500 transition focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            Accept
                        </button>
                        <button
                            onClick={handleDecline}
                            className="bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}

            {isCallAccepted && (
                <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-lg text-center animate-fade-in">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {`In Call with ${callingUser}`}
                    </h2>
                    <div className="relative flex flex-col items-center gap-4 mb-6">
                        {!isVideoCall && (
                            <>
                                <audio ref={localAudioRef} autoPlay muted hidden />
                                <audio ref={remoteAudioRef} autoPlay hidden />
                            </>
                        )}
                        {isVideoCall && (
                            <div className="flex gap-4">
                                <video
                                    autoPlay
                                    muted
                                    ref={localVideoRef}
                                    className="w-28 h-28 bg-gray-800 rounded-full overflow-hidden shadow-md border border-gray-600"
                                />
                                <video
                                    autoPlay
                                    ref={remoteVideoRef}
                                    className="w-40 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-600"
                                />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleDecline}
                        className="bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        End Call
                    </button>
                </div>
            )}
        </div>
    );

};

export default CallComponent;
