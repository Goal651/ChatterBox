import { useEffect, useRef, useState, useCallback } from "react";
import { GroupMessage, Message, MessageProps } from "../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { getGroupMessagesApi, getMessagesApi } from "../api/MessageApi";
import UserMessages from "../components/UserMessages";
import GroupMessages from "../components/GroupMessages";


export default function Messages({
    serverUrl,
    sentMessages,
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
                const result2 = await getGroupMessagesApi(serverUrl, componentId)
                if (result2) {
                    setGroupMessages(result2.messages)
                }
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setIsLoading(false);
        }
    }, [componentId, serverUrl]);

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

    }, [sentMessages,sentGroupMessage])


    useEffect(() => {
        const handleReceiveMessage = ({ message }: { message: Message }) => {
            if (message.sender === component._id) {
                setUserMessages((prev) => [...prev, message]);
                socket.emit("messageSeen", { messageId: message._id, receiverId: message.sender });
            }
        };

        const handleSocketMessage = (data: { sentMessage: Message; messageId: string }) => {
            setUserMessages((prev): Message[] =>
                prev.map((msg) => msg._id === data.messageId ? data.sentMessage : msg)
            );
        };

        const handleSentMessage = (data: Message) => {
            setUserMessages((prev): Message[] => {
                const isMessageThere = prev.filter(x => x._id == data._id)
                if (isMessageThere.length > 0) return prev
                return [...prev, data]
            }
            );
        };

        const handleReceivedMessage = (data: { messageId: string }) => {
            setUserMessages((prev): Message[] =>
                prev.map((msg) => msg._id === data.messageId ? { ...msg, isMessageReceived: true } : msg)
            );
        }

        const handleSeenMessage = (data: { messageId: string }) => {
            setUserMessages((prev): Message[] =>
                prev.map((msg) => msg._id === data.messageId ? { ...msg, isMessageReceived: true, isMessageSeen: true } : msg)
            );
        }

        const handleReceiveGroupMessage = ({ message }: { message: GroupMessage }) => {
            console.log(message)
            if (message.group === componentId) {
                setGroupMessages((prev) => [...prev, message]);
                socket.emit("groupMessageSeen", { messageId: message._id, receiverId: message.sender });
            }
        }

        if (socket) {
            socket.on("receiveMessage", handleReceiveMessage);
            socket.on("messageSent", handleSocketMessage);
            socket.on("receiveSentMessage", handleSentMessage)
            socket.on("messageReceived", handleReceivedMessage);
            socket.on("messageSeen", handleSeenMessage);
            socket.on("receiveGroupMessage", handleReceiveGroupMessage)
        }

        return () => {
            if (socket) {
                socket.off("receiveMessage", handleReceiveMessage);
                socket.off("messageSent", handleSocketMessage);
                socket.off("receiveSentMessage", handleSentMessage)
                socket.off("messageReceived", handleReceivedMessage);
                socket.off("messageSeen", handleSeenMessage);
                socket.off("receiveGroupMessage", handleReceiveGroupMessage)

            }
        };
    }, [socket, socketMessage]);


    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (socket && lastMessage && lastMessage.sender === componentId && !lastMessage.isMessageSeen) {
            socket.emit("messageSeen", { messageId: lastMessage._id, receiverId: component._id });
        }
    }, [componentId, lastMessage, socket, component]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col space-y-4 items-center justify-center">
                <div className="loading loading-lg loading-spinner"></div>
            </div>
        );
    }

    if (!componentId) {
        return (
            <div className="h-full flex flex-col space-y-4 items-center justify-center">
                <div className="text-gray-400 text-center">Select a component to continue</div>
            </div>
        );
    }

    return (
        <>
            {sessionType === 'chat' ? (
                <UserMessages
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
        </>
    );
}
