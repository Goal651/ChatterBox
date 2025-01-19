import { useEffect, useRef, useState, useCallback } from "react";
import { Message, MessageProps, User } from "../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { getMessagesApi } from "../api/api";
import FilePreview from "../utilities/FilePreview";


export default function Messages({
    serverUrl,
    sentMessages,
    socketMessage,
    socket,
    friend,
    mediaType
}: MessageProps) {
    const { friendId } = useParams();
    const user: User = JSON.parse(sessionStorage.getItem("currentUser") || "{}") || null;
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesRef = useRef<Message[]>([]);
    const endMessageRef = useRef<HTMLDivElement | null>(null);
    const currentUser = user._id;

    const scrollBottom = useCallback(() => {
        endMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);


    const fetchMessages = useCallback(async () => {
        if (!friendId) return;
        try {
            setIsLoading(true);
            const result = await getMessagesApi(serverUrl, friendId, 0);
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
    }, [friendId, serverUrl]);

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
        const handleReceiveMessage = ({ message }: { message: Message }) => {
            if (message.sender === friend._id) {
                setMessages((prev) => [...prev, message]);
                socket.emit("messageSeen", { messageId: message._id, receiverId: message.sender });
            }
        };

        const handleSocketMessage = (data: { sentMessage: Message; messageId: string }) => {
            setMessages((prev): Message[] =>
                prev.map((msg) => msg._id === data.messageId ? data.sentMessage : msg)
            );
        };

        const handleSentMessage = (data: Message) => {
            setMessages((prev): Message[] => {
                const isMessageThere = prev.filter(x => x._id == data._id)
                if (isMessageThere.length > 0) return prev
                return [...prev, data]
            }
            );
        };

        const handleReceivedMessage = (data: { messageId: string }) => {
            setMessages((prev): Message[] =>
                prev.map((msg) => msg._id === data.messageId ? { ...msg, isMessageReceived: true } : msg)
            );
        }

        const handleSeenMessage = (data: { messageId: string }) => {
            setMessages((prev): Message[] =>
                prev.map((msg) => msg._id === data.messageId ? { ...msg, isMessageReceived: true, isMessageSeen: true } : msg)
            );
        }

        if (socket) {
            socket.on("receiveMessage", handleReceiveMessage);
            socket.on("messageSent", handleSocketMessage);
            socket.on("receiveSentMessage", handleSentMessage)
            socket.on("messageReceived", handleReceivedMessage);
            socket.on("messageSeen", handleSeenMessage);
        }

        return () => {
            if (socket) {
                socket.off("receiveMessage", handleReceiveMessage);
                socket.off("messageSent", handleSocketMessage);
                socket.off("receiveSentMessage", handleSentMessage)
                socket.off("messageReceived", handleReceivedMessage);
                socket.off("messageSeen", handleSeenMessage);
            }
        };
    }, [socket, socketMessage]);

    useEffect(() => {
        scrollBottom();
    }, [messages, friendId, scrollBottom]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (socket && lastMessage && lastMessage.sender === friendId && !lastMessage.isMessageSeen) {
            socket.emit("messageSeen", { messageId: lastMessage._id, receiverId: user._id });
        }
    }, [friendId, lastMessage, socket, user]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col space-y-4 items-center justify-center">
                <div className="loading loading-lg loading-spinner"></div>
            </div>
        );
    }

    if (!friendId) {
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
                    const isReceiver = message.receiver === friendId;
                    const bubbleClass = isReceiver ? "bg-blue-600" : "bg-gray-900";
                    return (
                        <div key={message._id}>
                            <div className={`chat ${isReceiver ? "chat-end " : "chat-start"} max-h-full w-full`}>
                                <div className={`chat-bubble rounded-lg break-words min-w-16 ${bubbleClass} ${mediaType.isMobile ? "max-w-full" : "max-w-96 "}`}>
                                    {message.type == 'text' ? (
                                        <div className="text-white ">{message.message}</div>
                                    ) : (
                                        <div className={`bg-transparent rounded-xl ${message.message.split(".").pop() === "mp3" ? "h-12 rounded-3xl w-full" : "h-fif w-full"}`}>
                                            <FilePreview
                                                files={message.message}
                                                serverUrl={serverUrl}
                                                mediaType={mediaType}
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
