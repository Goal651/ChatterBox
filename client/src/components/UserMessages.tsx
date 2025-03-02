import { useParams } from "react-router-dom";
import { Message } from "../interfaces/interfaces";
import FilePreview from "../utilities/FilePreview";
import { useCallback, useEffect, useRef } from "react";

interface UserMessagesProps {
    messages: Message[],
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
    serverUrl: string
}


export default function UserMessages({ messages, mediaType, serverUrl }: UserMessagesProps) {
    const { componentId } = useParams()
    const endMessageRef = useRef<HTMLDivElement | null>(null);


    const scrollBottom = useCallback(() => {
        endMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollBottom();
    }, [messages, componentId, scrollBottom]);


    return (
        <div className="h-full w-full flex flex-col overflow-x-hidden overflow-y-auto space-y-4">
            {messages.length > 0 ? (
                messages.map((message) => {
                    const isReceiver = message.receiver === componentId;
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
                                {message.receiver === componentId && (
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
    )
}