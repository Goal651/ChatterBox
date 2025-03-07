import { useParams } from "react-router-dom";
import { Message, User } from "../interfaces/interfaces";
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
    const currentUserData = sessionStorage.getItem('currentUser')
    const currentUser: User = JSON.parse(currentUserData || '{}')


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
                    const isReceiver = message.sender === componentId;
                    const isSender = message.sender === currentUser._id;
                    const bubbleClass = isSender ? "bg-blue-600" : "bg-gray-900";
                    return (
                        <div key={message._id} className="relative flex w-full">
                            <div className={`chat grid grid-cols-[auto] p-4 gap-1 ${isSender ? "chat-end" : "chat-start"} max-h-full w-full`}>
                                <div className={`relative flex items-center ${isSender && 'flex-row-reverse'}`}>

                                    <div className={`chat-bubble relative rounded-lg break-words min-w-16 ${bubbleClass} ${mediaType.isMobile ? "max-w-full" : "max-w-96"}`}>
                                        {message.type === 'text' ? (
                                            <div className="text-white">{message.message}</div>
                                        ) : (
                                            <div className={`bg-transparent rounded-xl ${message.message.split(".").pop() === "mp3" ? "h-12 rounded-3xl w-full" : "h-fif w-full"}`}>
                                                <FilePreview files={message.message} serverUrl={serverUrl} mediaType={mediaType} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="rounded-full shadow-md opacity-80 hover:opacity-100 transition-opacity duration-200">
                                        <div className={`dropdown  ${isReceiver ? 'dropdown-right' : 'dropdown-left'}`}>
                                            <div tabIndex={0} role="button" className="btn btn-sm p-1">⬆️</div>
                                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                                <li><a>Reply</a></li>
                                                <li><a>Forward</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Footer (Seen/Sent) */}
                                {isSender && (
                                    <div className="chat-footer text-gray-500 place-self-end">
                                        {message.isMessageSent ? (
                                            message.isMessageReceived ? (
                                                message.isMessageSeen ? 'seen' : 'received'
                                            ) : 'sent'
                                        ) : "not sent"}
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