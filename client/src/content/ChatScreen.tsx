import { FaArrowLeft, FaEllipsisV, FaPhone, FaVideo } from "react-icons/fa";
import Messages from "./Messages";
import Sender from "./Sender";
import { ChatScreenProps, Message, SocketMessageProps, User } from "../interfaces/interfaces";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfilePicturePreview from "../utilities/ProfilePicturePreview";
import AudioCall from "../utilities/AudioCall";

const ChatScreen = ({ socket, users, serverUrl, sentMessage, onlineUsers, mediaType, loadedImage, photos }: ChatScreenProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState<Message | null>(null);
    const [socketMessage, setSocketMessage] = useState<SocketMessageProps | null>(null);
    const [isUserTyping, setIsUserTyping] = useState(false)
    const { friendId } = useParams();
    const navigate = useNavigate()
    const [isCalling, setIsCalling] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)

    useEffect(() => {
        const result = users.find((user) => user._id === friendId);
        if (result) {
            setUser(result);
            sessionStorage.setItem("selectedUser", JSON.stringify(result));
        }
    }, [users, friendId]);

    const handleSentMessage = ({ message }: { message: Message }) => {
        if (message) {
            setMessage(message);
            sentMessage(message);
        }
    };

    const handleVideoCall = () => {
        setIsCalling(true)
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then(async (stream) => {
                setStream(stream);
                const myPeerConnection = new RTCPeerConnection();
                setPeerConnection(myPeerConnection)
                stream.getTracks().forEach(track => myPeerConnection.addTrack(track, stream))
                myPeerConnection.onicecandidate = (data) => {
                    if (data.candidate) {
                        socket.emit('sendIceCandidate', {
                            receiverId: friendId,
                            candidate: data.candidate
                        })
                    }
                }
                const offer = await myPeerConnection.createOffer()
                await myPeerConnection.setLocalDescription(offer)

                socket.emit("startCall", { offer, receiverId: friendId })
            })
            .catch((error) => console.error(error));
    }

    const handleVideoCallCancel = () => {
        setIsCalling(false)
        if (socket) socket.emit('cancelCall', { receiverId: friendId })
        if (stream) stream.getTracks().forEach((track) => track.stop());

    }


    useEffect(() => {
        if (!socket) return;

        const handleSocketMessage = (data: { sentMessage: Message; messageId: string }) => {
            setSocketMessage(data);
            sentMessage(data.sentMessage);
        };

        const handleTypingUser = (data: { typingUserId: string }) => {
            if (friendId == data.typingUserId) {
                setIsUserTyping(true)
            } else setIsUserTyping(false)
        }

        const handleNotTypingUser = (data: { typingUserId: string }) => {
            if (friendId == data.typingUserId) {
                setIsUserTyping(false)
            }
        }

        const handleCallRejected = () => {
            if (stream) stream.getTracks().forEach((track) => track.stop());
            setIsCalling(false)
        }

        const handleCallAccepted = (data: { offer: RTCSessionDescriptionInit; receiverId: string }) => {
            try {
                // Stop any existing tracks in the local stream
                if (stream) stream.getTracks().forEach((track) => track.stop());
                
                // Update the calling state
                setIsCalling(true);
        
                // Ensure the peer connection exists
                if (!peerConnection) return;
        
                // Add local tracks to the peer connection
                stream?.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
        
                // Handle ICE candidates
                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('sendIceCandidate', {
                            receiverId: friendId,
                            candidate: event.candidate,
                        });
                    }
                };
        
                // Handle remote streams
                peerConnection.ontrack = (event) => {
                    const [remoteStream] = event.streams; // Get the remote stream
                    setRemoteStream(remoteStream); // Update state with the remote stream
                };
        
                // Set the remote description from the offer
                peerConnection.setRemoteDescription(data.offer);
        
                // Create and send an answer
                peerConnection
                    .createAnswer()
                    .then((answer) => {
                        peerConnection.setLocalDescription(answer);
                        socket.emit('callAccepted', { answer, receiverId: friendId });
                    })
                    .catch((error) => console.error("Error creating answer:", error));
            } catch (error) {
                console.error("Error handling call acceptance:", error);
            }
        };
        
        socket.on("receiveMessage", handleSentMessage);
        socket.on("messageSent", handleSocketMessage);
        socket.on("userTyping", handleTypingUser)
        socket.on("userNotTyping", handleNotTypingUser)
        socket.on("callRejected", handleCallRejected)
        socket.on("callAccepted", handleCallAccepted)

        return () => {
            socket.off("receiveMessage", handleSentMessage);
            socket.off("messageSent", handleSocketMessage);
            socket.off("userTyping", handleTypingUser)
            socket.off("userNotTyping", handleNotTypingUser)
            socket.off("callRejected", handleCallRejected)
        };
    }, [socket]);

    if (!user) return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
                Select friend to start chatting
            </div>
        </div>
    )

    return (
        <>
            <AudioCall
                onCancel={handleVideoCallCancel}
                visible={isCalling}
                to={user.username}
                stream={stream}
                remoteStream={remoteStream} />

            <div className=" flex justify-between border-b border-slate-700 pb-6 ">
                <div className="flex space-x-2 items-center">
                    {(mediaType.isMobile || mediaType.isTablet) && (
                        <FaArrowLeft
                            className="text-white"
                            onClick={() => navigate('/chat/')}
                        />
                    )}
                    <div
                        className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 object-cover rounded-full"

                    >
                        <ProfilePicturePreview
                            profilePicture={user?.image}
                            serverUrl={serverUrl}
                            loadedImage={loadedImage}
                            photos={photos} />
                    </div>

                    <div className="flex flex-col">
                        <div className="text-white font-semibold text-xl">{user?.username}</div>
                        {isUserTyping ? (
                            <div className="text-green-500">typing...</div>
                        ) : (onlineUsers.includes(user?._id) && (
                            <div className="text-gray-400">Online</div>
                        ))}
                    </div>
                </div>
                <div className="flex space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 items-center">
                    <FaPhone className="rotate-90 text-blue-500 w-6 h-6" />
                    <FaVideo
                        onClick={handleVideoCall}
                        className="text-blue-500 w-6 h-6" />
                    <FaEllipsisV className="text-blue-500 w-6 h-6" />
                </div>
            </div>

            <div className="h-full flex flex-col space-y-4 overflow-hidden">
                <div className="h-[40rem] w-full lg:mt-6 xl:mt-10 overflow-hidden">
                    <Messages
                        user={user}
                        serverUrl={serverUrl}
                        sentMessages={message}
                        socketMessage={socketMessage}
                        socket={socket}
                        friend={user}
                        mediaType={mediaType}
                    />
                </div>
                <div className="h-1/6 flex items-center">
                    <Sender socket={socket} sentMessage={handleSentMessage} serverUrl={serverUrl} />
                </div>
            </div>
        </>
    );
};

export default ChatScreen;
