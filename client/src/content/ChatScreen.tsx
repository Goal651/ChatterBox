import { FaEllipsisV, FaPhone, FaVideo } from "react-icons/fa";
import Messages from "./Messages";
import Sender from "./Sender";
import { Socket } from "socket.io-client";
import { Message, User } from "../interfaces/interfaces";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface ChatScreenProps {
    socket: Socket;
    users: User[];
    serverUrl: string;
    sentMessage: (message: Message) => void;
    onlineUsers: string[]
}

interface SocketMessageProps {
    sentMessage: Message;
    messageId: string | number;
}

const ChatScreen = ({ socket, users, serverUrl, sentMessage, onlineUsers }: ChatScreenProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState<Message | null>(null);
    const [socketMessage, setSocketMessage] = useState<SocketMessageProps | null>(null);
    const [isUserTyping, setIsUserTyping] = useState(false)
    const { id } = useParams();

    useEffect(() => {
        const result = users.find((user) => user._id === id);
        if (result) {
            setUser(result);
            sessionStorage.setItem("selectedUser", JSON.stringify(result));
        }
    }, [users, id]);

    const handleSentMessage = (message: Message) => {
        if (message) {
            setMessage(message);
            sentMessage(message);
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleSocketMessage = (data: { sentMessage: Message; messageId: string }) => {
            setSocketMessage(data);
            sentMessage(data.sentMessage);
        };

        const handleTypingUser = (data: { typingUserId: string }) => {
            if (id == data.typingUserId) {
                setIsUserTyping(true)
            } else setIsUserTyping(false)
        }

        const handleNotTypingUser = (data: { typingUserId: string }) => {
            if (id == data.typingUserId) {
                setIsUserTyping(false)
            }
        }

        socket.on("receiveMessage", handleSentMessage);
        socket.on("messageSent", handleSocketMessage);
        socket.on("userTyping", handleTypingUser)
        socket.on("userNotTyping", handleNotTypingUser)

        return () => {
            socket.off("receiveMessage", handleSentMessage);
            socket.off("messageSent", handleSocketMessage);
        };
    }, [socket, sentMessage]);

    if (!user) return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
                Select friend to start chatting
            </div>
        </div>
    )

    return (
        <>
            <div className="flex justify-between border-b border-slate-700 pb-6">
                <div className="flex space-x-4 items-center">
                    <img
                        src={user?.image || "/image.png"}
                        alt="User Avatar"
                        className="w-16 h-16 object-cover rounded-full"
                    />
                    <div className="flex flex-col">
                        <div className="text-white font-semibold text-xl">{user?.username}</div>
                        {isUserTyping ? (
                            <div className="text-green-500">typing...</div>
                        ) : (onlineUsers.includes(user?._id) && (
                            <div className="text-gray-400">Online</div>
                        ))}
                    </div>
                </div>
                <div className="flex space-x-8 items-center">
                    <FaPhone className="rotate-90 text-blue-500 w-6 h-6" />
                    <FaVideo className="text-blue-500 w-6 h-6" />
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
