// import React, { useEffect, useRef, useState } from "react";
// import { FaArrowLeft, FaEllipsisV, FaPhone, FaVideo } from "react-icons/fa";
// import Messages from "./Messages";
// import Sender from "./Sender";
// import { ChatScreenProps, Message, SocketMessageProps, User } from "../interfaces/interfaces";
// import { useNavigate, useParams } from "react-router-dom";
// import ProfilePicturePreview from "../utilities/ProfilePicturePreview";
// import AudioCall from "../utilities/AudioCall";

// const ChatScreen = ({ socket, users, serverUrl, sentMessage, onlineUsers, mediaType, loadedImage, photos }: ChatScreenProps) => {
//     const [user, setUser] = useState<User | null>(null);
//     const [isUserTyping, setIsUserTyping] = useState(false);
//     const { friendId } = useParams();
//     const navigate = useNavigate();
//     const [isCalling, setIsCalling] = useState(false);
//     const [stream, setStream] = useState<MediaStream | null>(null);
//     const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
//     const localVideoRef = useRef<HTMLVideoElement>(null);
//     const remoteVideoRef = useRef<HTMLVideoElement>(null);

//     useEffect(() => {
//         const userData = users.find((user) => user._id === friendId);
//         if (userData) {
//             setUser(userData);
//         }
//     }, [users, friendId]);

//     const handleVideoCall = async () => {
//         setIsCalling(true);

//         // Initialize Media Stream
//         const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         setStream(localStream);

//         // Display local stream
//         if (localVideoRef.current) {
//             localVideoRef.current.srcObject = localStream;
//         }

//         // Create Peer Connection
//         const pc = new RTCPeerConnection();
//         setPeerConnection(pc);

//         // Add local stream to Peer Connection
//         localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

//         // Handle ICE Candidates
//         pc.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket.emit("iceCandidate", { candidate: event.candidate, to: friendId });
//             }
//         };

//         // Handle Remote Stream
//         pc.ontrack = (event) => {
//             const [remoteStream] = event.streams;
//             if (remoteVideoRef.current) {
//                 remoteVideoRef.current.srcObject = remoteStream;
//             }
//         };

//         // Create Offer
//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(offer);

//         // Send Offer to the Receiver
//         socket.emit("startCall", { offer, receiverId: friendId });
//     };

//     const handleIncomingCall = async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
//         const pc = new RTCPeerConnection();
//         setPeerConnection(pc);

//         // Initialize Media Stream
//         const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         setStream(localStream);

//         // Display local stream
//         if (localVideoRef.current) {
//             localVideoRef.current.srcObject = localStream;
//         }

//         // Add local stream to Peer Connection
//         localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

//         // Handle ICE Candidates
//         pc.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket.emit("iceCandidate", { candidate: event.candidate, to: friendId });
//             }
//         };

//         // Handle Remote Stream
//         pc.ontrack = (event) => {
//             const [remoteStream] = event.streams;
//             if (remoteVideoRef.current) {
//                 remoteVideoRef.current.srcObject = remoteStream;
//             }
//         };

//         // Set Remote Description
//         await pc.setRemoteDescription(new RTCSessionDescription(offer));

//         // Create and Send Answer
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         socket.emit("callAccepted", { answer, callerId: friendId });
//     };

//     const handleICECandidate = async ({ candidate }: { candidate: RTCIceCandidate }) => {
//         if (peerConnection) {
//             await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//     };

//     useEffect(() => {
//         if (!socket) return;

//         socket.on("incomingCall", handleIncomingCall);
//         socket.on("iceCandidate", handleICECandidate);

//         return () => {
//             socket.off("incomingCall", handleIncomingCall);
//             socket.off("iceCandidate", handleICECandidate);
//         };
//     }, [socket, peerConnection]);

//     return (
//         <>
//             <AudioCall visible={isCalling} />
//             <div>
//                 {/* Video Call UI */}
//                 <video ref={localVideoRef} autoPlay muted style={{ width: "300px" }} />
//                 <video ref={remoteVideoRef} autoPlay style={{ width: "300px" }} />
//                 <button onClick={handleVideoCall}>Start Call</button>
//             </div>
//         </>
//     );
// };

// export default ChatScreen;
