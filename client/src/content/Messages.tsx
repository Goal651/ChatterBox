import { useEffect, useRef, useState, useCallback } from "react";
import { Message, User } from "../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { getMessagesApi } from "../api/api";
import { Socket } from "socket.io-client";
import FilePreview from "../utilities/FilePreview";

interface MessageProps {
    user: User | null;
    serverUrl: string;
    sentMessages: Message | null;
    socketMessage: { sentMessage: Message; messageId: string | number } | null;
    socket: Socket;
}

export default function Messages({
    serverUrl,
    sentMessages,
    socketMessage,
    socket,
}: MessageProps) {
    const { id } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesRef = useRef<Message[]>([]);
    const endMessageRef = useRef<HTMLDivElement | null>(null);

    const user: User = JSON.parse(sessionStorage.getItem("currentUser") || "{}") || null;
    const currentUser = user?._id;

    const scrollBottom = useCallback(() => {
        endMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const result = await getMessagesApi(serverUrl, id, 0);
            const resultMessages: Message[] | null = result.messages;

            if (resultMessages) {
                setMessages(resultMessages);
                messagesRef.current = resultMessages;
                setLastMessage(resultMessages[resultMessages.length - 1] || null);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setIsLoading(false);
        }
    }, [id, serverUrl]);

    useEffect(() => {
        if (sentMessages) {
            setMessages((prev) => {
                if (!prev.some((msg) => msg._id === sentMessages._id)) {
                    return [...prev, sentMessages];
                }
                return prev;
            });
            setLastMessage(sentMessages);
        }
    }, [sentMessages]);

    useEffect(() => {
        const handleReceiveMessage = (data: Message) => {
            if (data.sender === id) {
                setMessages((prev) => [...prev, data]);
                socket.emit("messageSeen", { messageId: data._id, receiverId: data.sender });
            }
        };

        const handleSocketMessage = (data: { sentMessage: Message; messageId: string }) => {
            setMessages((prev): Message[] => {
                return prev.map((msg) => msg._id === data.messageId ? data.sentMessage : msg);
            });
        };

        if (socket) {
            socket.on("receiveMessage", handleReceiveMessage);
            socket.on("messageSent", handleSocketMessage);
        }

        return () => {
            if (socket) {
                socket.off("receiveMessage", handleReceiveMessage);
                socket.off("messageSent", handleSocketMessage);
            }
        };
    }, [socket, socketMessage]);

    useEffect(() => {
        scrollBottom();
    }, [messages, id, scrollBottom]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (socket && lastMessage && lastMessage.sender === id && !lastMessage.isMessageSeen) {
            socket.emit("messageSeen", { messageId: lastMessage._id });
        }
    }, [id, lastMessage, socket]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col space-y-4 items-center justify-center">
                <div className="loading loading-lg loading-spinner"></div>
            </div>
        );
    }

    if (!id) {
        return (
            <div className="h-full flex flex-col space-y-4 items-center justify-center">
                <div className="text-gray-400 text-center">Select a friend to continue</div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col overflow-x-hidden overflow-y-auto space-y-4">
            {messages.length > 0 ? (
                messages.map((message) => {
                    const isReceiver = message.receiver === id;
                    const bubbleClass = isReceiver ? "bg-blue-600" : "bg-gray-900";
                    return (
                        <div key={message._id}>
                            <div className={`chat ${isReceiver ? "chat-end " : "chat-start"} h-auto w-full`}>
                                <div className={`chat-bubble rounded-lg break-words min-w-16 max-w-96 ${bubbleClass}`}>
                                    {message.type == 'text' ? (
                                        <div className="text-white ">{message.message}</div>
                                    ) : (
                                        <div className={`w-80  bg-black rounded-xl ${message.message.split(".").pop() === "mp3" ? "h-12 rounded-3xl" : "h-72"}`}>
                                            <FilePreview
                                                files={message.message}
                                                serverUrl={serverUrl}
                                            />
                                        </div>
                                    )}
                                </div>
                                {message.sender === currentUser && (
                                    <div className="chat-footer text-gray-500">
                                        {message.isMessageSent ? (
                                            message.isMessageReceived ? (
                                                message.isMessageSeen ? 'seen' : 'received'
                                            ) : 'sent') : "not sent"}

                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-gray-400 text-center">No messages yet!</div>
            )}
            <div ref={endMessageRef} />
        </div>
    );
}
