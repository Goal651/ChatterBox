import React, { useEffect, useRef } from "react";

interface AudioCallProps {
    onCancel: () => void;
    visible: boolean;
    to: string;
    stream: MediaStream | null;
    remoteStream: MediaStream | null;
}

const AudioCall: React.FC<AudioCallProps> = ({ onCancel, visible, to, stream, remoteStream }) => {
    const myVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (stream && myVideoRef.current) {
            myVideoRef.current.srcObject = stream;
        }
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [stream, remoteStream]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Calling {to}...</h2>
                <p className="text-gray-400 mb-6">Waiting for the user to answer...</p>
                <div className="relative flex justify-center gap-4 mb-6">
                    {/* Local Video */}
                    <div className="w-28 h-28 bg-gray-800 rounded-full overflow-hidden shadow-md">
                        <video
                            ref={myVideoRef}
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
                    onClick={onCancel}
                    className="bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                    Cancel Call
                </button>
            </div>
        </div>
    );
};

export default AudioCall;
