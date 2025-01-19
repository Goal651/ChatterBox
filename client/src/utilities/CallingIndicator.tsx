import React, { useEffect, useRef, useState } from "react";
import { User } from "../interfaces/interfaces";

interface CallPopupProps {
    onAccept: () => void;
    onDecline: () => void;
    visible: boolean;
    from: string;
    users: User[];
    stream: MediaStream | null;
    remoteStream: MediaStream | null;
}

const CallPopup: React.FC<CallPopupProps> = ({ onAccept, onDecline, visible, from, users, remoteStream, stream }) => {
    const user = users.find(user => user._id === from);
    const username = user?.username || "Unknown User";
    const [callAccepted, setCallAccepted] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [stream, remoteStream]);

    const acceptCall = () => {
        setCallAccepted(true);
        onAccept();
    };

    const declineCall = () => {
        setCallAccepted(false);
        onDecline();
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 h-screen overflow-hidden">
            {callAccepted ? (
                <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-lg text-center">
                    <h2 className="text-xl font-semibold text-white mb-4">In Call with {username}</h2>
                    <div className="relative flex justify-center items-center gap-4 mb-6">
                        {/* Local Video */}
                        <div className="w-28 h-28 bg-gray-800 rounded-full overflow-hidden shadow-md">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                className="w-full h-full object-cover"
                            ></video>
                        </div>
                        {/* Remote Video */}
                        <div className="w-40 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                className="w-full h-full object-cover"
                            ></video>
                        </div>
                    </div>
                    <button
                        onClick={declineCall}
                        className="bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        End Call
                    </button>
                </div>
            ) : (
                <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Incoming Call</h2>
                    <p className="text-gray-400 mb-6">{username}</p>
                    <div className="bg-gray-700 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center text-3xl text-green-400 animate-pulse">
                        📞
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={acceptCall}
                            className="bg-green-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-500 transition focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            Accept
                        </button>
                        <button
                            onClick={declineCall}
                            className="bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallPopup;
