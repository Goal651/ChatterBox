import { useEffect, useRef, useState } from "react";
import Peer, { SignalData } from "simple-peer";
import { Socket } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../interfaces/interfaces";

interface CallUserData {
    from: string;
    signal: SignalData;
}

interface PeerCallerProps {
    socket: Socket
}



export default function PeerCaller({ socket }: PeerCallerProps) {
    const user = sessionStorage.getItem('currentUser')
    const userData: User = JSON.parse(user || '{}')
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [callerSignal, setCallerSignal] = useState<SignalData | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const { friendId } = useParams()
    const idToCall = friendId
    const caller = userData._id

    const navigate = useNavigate()

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Peer.Instance | null>(null);

    useEffect(() => {
        if (!socket) return
        navigator.mediaDevices.getUserMedia({ video: true, audio: true, })
            .then(stream => {
                setStream(stream)
                if (myVideo.current) myVideo.current.srcObject = stream
            })
            .catch(error => {
                console.error(error)
            })

        socket.on("incomingCall", (data: CallUserData) => {
            setReceivingCall(true);
            setCallerSignal(data.signal);
        });

        socket.on('callAccepted', (data: CallUserData) => {
            setCallAccepted(true);
            setCallerSignal(data.signal);
        })

        return () => {
            socket.off("incomingCall");
            socket.off('callAccepted')
        };
    }, []);

    const callUser = (id: string) => {
        if (!stream) {
            console.error("Stream not available. Cannot make a call.");
            return;
        }

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.emit("startCall", {
                userToCall: id,
                signalData: data,
            });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) userVideo.current.srcObject = currentStream;
        });

        socket.on("callAccepted", (signal: SignalData) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        if (!stream) {
            console.error("Stream not available. Cannot answer the call.");
            return;
        }

        setCallAccepted(true);

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.emit("acceptCall", { signal: data, to: caller });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        if (callerSignal) peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current?.destroy();
        connectionRef.current = null;
        navigate('/chat/' + friendId)
    };

    return (
        <>
            <h1 style={{ textAlign: "center", color: "#fff" }}>Video Call</h1>
            <div className="container">
                <div className="video-container">
                    <div className="video">
                        {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
                    </div>
                    <div className="video">
                        {callAccepted && !callEnded && (
                            <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
                        )}
                    </div>
                </div>
                <div className="myId">
                    <div>
                        {callAccepted && !callEnded ? (
                            <button
                                onClick={leaveCall}
                                style={{ padding: "10px", backgroundColor: "red", color: "white" }}
                            >
                                End Call
                            </button>
                        ) : (
                            <button
                                onClick={() => callUser(idToCall!)}
                                style={{ padding: "10px", backgroundColor: "green", color: "white" }}
                            >
                                Call
                            </button>
                        )}
                    </div>
                </div>
                {receivingCall && !callAccepted && (
                    <div>
                        <h1> is calling...</h1>
                        <button
                            onClick={answerCall}
                            style={{ padding: "10px", backgroundColor: "blue", color: "white" }}
                        >
                            Answer
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
