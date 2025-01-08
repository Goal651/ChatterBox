import { useEffect, useRef, useState } from "react";
import Peer, { SignalData } from "simple-peer";
import "./App.css";
import { Socket } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";

interface CallUserData {
    from: string;
    name: string;
    signal: SignalData;
}

interface PeerCallerProps {
    socket: Socket
}



export default function PeerCaller({ socket }: PeerCallerProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState<string>("");
    const [callerSignal, setCallerSignal] = useState<SignalData | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState<string>("");
    const { friendId } = useParams()
    const idToCall = friendId

    const navigate = useNavigate()

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Peer.Instance | null>(null);

    useEffect(() => {
        if (!socket) return
        navigator.mediaDevices.getUserMedia({ video: true, audio: true, })
            .then(stream => {
                setStream(stream)
                if (myVideo.current) {
                    myVideo.current.srcObject = stream;
                }
            })
            .catch(error => {
                console.error(error)
            })

        socket.on("callUser", (data: CallUserData) => {
            setReceivingCall(true);
            setCaller(data.from);
            setName(data.name);
            setCallerSignal(data.signal);
        });

        return () => {
            socket.off("callUser");
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
            socket.emit("callUser", {
                userToCall: id,
                signalData: data,
                name,
            });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
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
            socket.emit("answerCall", { signal: data, to: caller });
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
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
                    />

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
                        <h1>{name} is calling...</h1>
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
