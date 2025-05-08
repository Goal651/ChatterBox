import { useEffect, useRef, useState, useCallback } from "react";
import { GroupMessage, Message, MessageProps } from "../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { getGroupMessagesApi, getMessagesApi } from "../api/MessageApi";
import UserMessages from "../components/UserMessages";
import GroupMessages from "../components/shared/GroupMessages";

export default function Messages({
    serverUrl,
    sentMessages,
    onEditMessage,
    sentGroupMessage,
    socketMessage,
    socket,
    photos,
    images,
    mediaType,
    component
}: MessageProps) {
    const { componentId, sessionType } = useParams();
    const [userMessages, setUserMessages] = useState<Message[]>([]);
    const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesRef = useRef<Message[]>([]);

    const fetchMessages = useCallback(async () => {
        if (!componentId) return;
        try {
            setIsLoading(true);
            if (sessionType === 'chat') {
                const result = await getMessagesApi(serverUrl, componentId, 0);
                const resultMessages: Message[] | null = result.messages;
                if (resultMessages) {
                    setUserMessages(resultMessages);
                    messagesRef.current = resultMessages;
                    setLastMessage(resultMessages[resultMessages.length - 1] || null);
                }
            } else {
                const result2 = await getGroupMessagesApi(serverUrl, componentId);
                if (result2) {
                    setGroupMessages(result2.messages);
                }
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setIsLoading(false);
        }
    }, [componentId, serverUrl, sessionType]);

    useEffect(() => {
        if (sentMessages) {
            setUserMessages((prev) => {
                if (!prev.some((msg) => msg._id === sentMessages._id)) {
                    return [...prev, sentMessages];
                }
                return prev;
            });
            setLastMessage(sentMessages);
        }

        if (sentGroupMessage) {
            setGroupMessages((prev) => {
                if (!prev.some((msg) => msg._id === sentGroupMessage._id)) {
                    return [...prev, sentGroupMessage];
                }
                return prev;
            });
            setLastMessage(sentMessages);
        }
    }, [sentMessages, sentGroupMessage]);

    useEffect(() => {
        const handleReceiveMessage = ({ message }: { message: Message }) => {
            if (message.sender === component._id) {
                setUserMessages((prev) => [...prev, message]);
                socket.emit("messageSeen", { messageId: message._id, receiverId: message.sender });
            }
        };

        const handleSocketMessage = (data: { sentMessage: Message, messageId: string }) => {
            setUserMessages((prev): Message[] =>
                prev.map((msg) => msg._id === data.messageId ? data.sentMessage : msg)
            );
        };

        const handleSentMessage = (data: Message) => {
            setUserMessages((prev): Message[] => {
                const isMessageThere = prev.filter(x => x._id === data._id);
                if (isMessageThere.length > 0) return prev;
                return [...prev, data];
            });
        };

        const handleReceivedMessage = (data: { messageId: string }) => {
            setUserMessages((prev): Message[] =>
                prev.map((msg) => msg._id === data.messageId ? { ...msg, isMessageReceived: true } : msg)
            );
        };

        const handleSeenMessage = (data: { messageId: string }) => {
            setUserMessages((prev): Message[] =>
                prev.map((msg) => msg._id === data.messageId ? { ...msg, isMessageReceived: true, isMessageSeen: true } : msg)
            );
        };

        const handleReceiveGroupMessage = ({ message }: { message: GroupMessage }) => {
            if (message.group === componentId) {
                setGroupMessages((prev) => [...prev, message]);
                socket.emit("groupMessageSeen", { messageId: message._id, receiverId: message.sender });
            }
        };

        if (socket) {
            socket.on("receiveMessage", handleReceiveMessage);
            socket.on("messageSent", handleSocketMessage);
            socket.on("receiveSentMessage", handleSentMessage);
            socket.on("messageReceived", handleReceivedMessage);
            socket.on("messageSeen", handleSeenMessage);
            socket.on("receiveGroupMessage", handleReceiveGroupMessage);
        }

        return () => {
            if (socket) {
                socket.off("receiveMessage", handleReceiveMessage);
                socket.off("messageSent", handleSocketMessage);
                socket.off("receiveSentMessage", handleSentMessage);
                socket.off("messageReceived", handleReceivedMessage);
                socket.off("messageSeen", handleSeenMessage);
                socket.off("receiveGroupMessage", handleReceiveGroupMessage);
            }
        };
    }, [component._id, componentId, socket, socketMessage]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (socket && lastMessage && lastMessage.sender === componentId && !lastMessage.isMessageSeen) {
            socket.emit("messageSeen", { messageId: lastMessage._id, receiverId: component._id });
        }
    }, [componentId, lastMessage, socket, component]);

    const handleDeleteMessage = (message: Message) => {
        const updatedMessages = userMessages.filter((msg) => msg._id !== message._id);
        setUserMessages(updatedMessages);
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center shadow-inner">
                <svg className="animate-spin h-12 w-12 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                </svg>
                <span className="mt-4 text-gray-300 text-lg font-medium">Loading messages...</span>
            </div>
        );
    }

    if (!componentId) {
        return (
            <div className="h-full flex flex-col items-center justify-center ">
                <span className="text-gray-300 text-lg font-medium">Select a friend or group to view messages</span>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 ">
            {sessionType === 'chat' ? (
                <UserMessages
                    onDeleteMessage={handleDeleteMessage}
                    onEditMessage={onEditMessage}
                    mediaType={mediaType}
                    messages={userMessages}
                    serverUrl={serverUrl}
                />
            ) : (
                <GroupMessages
                    mediaType={mediaType}
                    messages={groupMessages}
                    serverUrl={serverUrl}
                    photos={photos}
                    images={images}
                />
            )}
        </div>
    );
}