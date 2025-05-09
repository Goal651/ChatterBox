import { FaArrowLeft, FaEllipsisV, FaPhone, FaVideo } from "react-icons/fa";
import Messages from "./Messages";
import Sender from "../components/shared/Sender";
import { ChatScreenProps, GroupMessage, GroupUser, Message, SocketMessageProps } from "../interfaces/interfaces";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfilePicturePreview from "../components/shared/ProfilePicturePreview";
import CallComponent from "../components/shared/CallComponent";

const ChatScreen = ({
    socket,
    users,
    sentMessage,
    sentGroupMessage,
    onlineUsers,
    mediaType,
    loadedImage,
    photos,
    groups
}: ChatScreenProps) => {
    const [component, setComponent] = useState<GroupUser | null>(null);
    const [message, setMessage] = useState<Message | null>(null);
    const [messageInEdition, setMessageInEdition] = useState<Message | null>(null);
    const [groupMessage, setGroupMessage] = useState<GroupMessage | null>(null);
    const [socketMessage, setSocketMessage] = useState<SocketMessageProps | null>(null);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const { componentId, sessionType } = useParams();
    const navigate = useNavigate();
    const [callType, setCallType] = useState(false);
    const [isUserCalling, setIsUserCalling] = useState(false);

    useEffect(() => {
        let result: GroupUser | null = null;
        if (sessionType === 'chat') {
            result = users.find((user) => user._id === componentId) as GroupUser;
        } else if (sessionType === 'group') {
            result = groups.find((group) => group._id === componentId) as unknown as GroupUser;
        }
        if (result) {
            setComponent(result);
            sessionStorage.setItem("selectedUser", JSON.stringify(result));
        }
    }, [users, componentId, groups, sessionType]);

    const handleSentMessage = ({ message }: { message: Message }) => {
        setMessage(message);
        sentMessage(message);
    };

    const handleSentGroupMessage = ({ message }: { message: GroupMessage }) => {
        if (message) {
            setGroupMessage(message);
            sentGroupMessage(message);
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleSocketMessage = (data: { sentMessage: Message; messageId: string }) => {
            setSocketMessage(data);
            sentMessage(data.sentMessage);
        };

        const handleTypingUser = (data: { typingUserId: string }) => {
            if (componentId === data.typingUserId) {
                setIsUserTyping(true);
            } else {
                setIsUserTyping(false);
            }
        };

        const handleNotTypingUser = (data: { typingUserId: string }) => {
            if (componentId === data.typingUserId) {
                setIsUserTyping(false);
            }
        };

        socket.on("receiveMessage", handleSentMessage);
        socket.on("messageSent", handleSocketMessage);
        socket.on("userTyping", handleTypingUser);
        socket.on("userNotTyping", handleNotTypingUser);

        return () => {
            socket.off("receiveMessage", handleSentMessage);
            socket.off("messageSent", handleSocketMessage);
            socket.off("userTyping", handleTypingUser);
            socket.off("userNotTyping", handleNotTypingUser);
        };
    }, [socket, componentId, sentMessage]);

    const handleAudioCall = () => {
        setCallType(false);
        setIsUserCalling(true);
    };

    const handleVideoCall = () => {
        setCallType(true);
        setIsUserCalling(true);
    };

    const handleCallCancellation = () => {
        setCallType(false);
        setIsUserCalling(false);
    };

    const handleCallEnded = () => {
        setCallType(false);
        setIsUserCalling(false);
    };

    const handleEditMessage = (message: Message) => {
        setMessageInEdition(message);
    };

    if (!component) return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-gray-300 text-lg font-medium">Select a friend or group to start chatting</div>
        </div>
    );

    return (
        <div className="flex flex-col h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <CallComponent
                users={users}
                isVideoCall={callType}
                socket={socket}
                isUserCalling={isUserCalling}
                onCancel={handleCallCancellation}
                isOutgoingCall={isUserCalling}
                isIngoingCall={false}
                callEnded={handleCallEnded}
            />

            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-700/50 pb-4 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="flex items-center space-x-4">
                    {(mediaType.isMobile || mediaType.isTablet) && (
                        <FaArrowLeft
                            className="text-gray-200 w-6 h-6 hover:text-blue-400 cursor-pointer transition-colors duration-200"
                            onClick={() => navigate('/chat/')}
                        />
                    )}
                    <div className="relative group w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full">
                        <ProfilePicturePreview
                            profilePicture={component?.image}
                            loadedImage={loadedImage}
                            photos={photos}
                            username={sessionType === 'chat' ? component.username || 'U' : component.groupName || ''}
                            textSize="text-3xl"
                            className="rounded-full border-2 border-gray-700 transition-transform duration-300 group-hover:scale-105 group-hover:border-blue-500"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-100 font-semibold text-xl tracking-tight">
                            {sessionType === 'chat' ? component.username : component.groupName}
                        </span>
                        {isUserTyping ? (
                            <span className="text-green-400 text-sm animate-pulse">Typing...</span>
                        ) : onlineUsers.includes(component?._id) ? (
                            <span className="text-gray-400 text-sm">Online</span>
                        ) : (
                            <span className="text-gray-500 text-sm">Offline</span>
                        )}
                    </div>
                </div>
                <div className="flex space-x-4 items-center">
                    <FaPhone
                        onClick={handleAudioCall}
                        className="text-blue-500 w-6 h-6 rotate-90 hover:text-blue-400 cursor-pointer transition-colors duration-200"
                    />
                    <FaVideo
                        onClick={handleVideoCall}
                        className="text-blue-500 w-6 h-6 hover:text-blue-400 cursor-pointer transition-colors duration-200"
                    />
                    <FaEllipsisV
                        className="text-blue-500 w-6 h-6 hover:text-blue-400 cursor-pointer transition-colors duration-200"
                        onClick={() => navigate('setting')}
                    />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col flex-1 space-y-6 overflow-hidden py-6 bg-transparent">
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    <Messages
                        component={component}
                        sentMessages={message}
                        sentGroupMessage={groupMessage}
                        socketMessage={socketMessage}
                        socket={socket}
                        mediaType={mediaType}
                        photos={photos}
                        images={loadedImage}
                        onEditMessage={handleEditMessage}
                    />
                </div>
                <div className="flex-shrink-0">
                    <Sender
                        socket={socket}
                        sentMessage={handleSentMessage}
                        sentGroupMessage={handleSentGroupMessage}
                        messageInEdition={messageInEdition}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatScreen;