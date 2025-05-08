import { useParams } from "react-router-dom";
import { Message, User } from "../interfaces/interfaces";
import FilePreview from "./FilePreview";
import { useCallback, useEffect, useRef } from "react";

interface UserMessagesProps {
    messages: Message[];
    onEditMessage: (message: Message) => void;
    onDeleteMessage: (message: Message) => void;
    mediaType: {
        isDesktop: boolean;
        isTablet: boolean;
        isMobile: boolean;
    };
    serverUrl: string;
}

export default function UserMessages({ messages, mediaType, serverUrl, onDeleteMessage, onEditMessage }: UserMessagesProps) {
    const { componentId } = useParams();
    const endMessageRef = useRef<HTMLDivElement | null>(null);
    const currentUserData = sessionStorage.getItem('currentUser');
    const currentUser: User = JSON.parse(currentUserData || '{}');

    const scrollBottom = useCallback(() => {
        endMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollBottom();
    }, [messages, componentId, scrollBottom]);

    return (
        <div className="h-full w-full flex flex-col overflow-x-hidden overflow-y-auto space-y-6 p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {messages.length > 0 ? (
                messages.map((message) => {
                    const isSender = message.sender === currentUser._id;
                    const bubbleClass = isSender ? "bg-blue-600/90" : "bg-gray-800/90";

                    return (
                        <div key={message._id} className={`flex w-full ${isSender ? "justify-end" : "justify-start"}`}>
                            <div className={`chat flex flex-col gap-1 max-w-[75%] ${isSender ? "items-end" : "items-start"}`}>
                                <div className="relative group flex items-center gap-2">
                                    {/* Message Bubble */}
                                    <div className={`chat-bubble rounded-xl p-3 shadow-md break-words min-w-16 ${bubbleClass} ${mediaType.isMobile ? "max-w-full" : "max-w-md"} transition-all duration-200 hover:shadow-lg`}>
                                        {message.type === 'text' ? (
                                            <div className="text-gray-100 text-sm">{message.message}</div>
                                        ) : (
                                            <div className={`${message.message.split(".").pop() === "mp3" ? "h-12 w-full" : "max-w-xs"} bg-transparent rounded-xl`}>
                                                <FilePreview files={message.message} serverUrl={serverUrl} mediaType={mediaType} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Dropdown */}
                                    {isSender && (
                                        <div className="dropdown dropdown-end">
                                            <div tabIndex={0} role="button" className="btn btn-sm p-1 bg-gray-700/80 rounded-full shadow-md opacity-80 hover:opacity-100 hover:bg-gray-600 transition-all duration-200">
                                                <svg fill="#fff" height="16px" width="16px" viewBox="0 0 330 330" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M325.606,229.393l-150.004-150C172.79,76.58,168.974,75,164.996,75c-3.979,0-7.794,1.581-10.607,4.394l-149.996,150c-5.858,5.858-5.858,15.355,0,21.213c5.857,5.857,15.355,5.858,21.213,0l139.39-139.393l139.397,139.393C307.322,253.536,311.161,255,315,255c3.839,0,7.678-1.464,10.607-4.394C331.464,244.748,331.464,235.251,325.606,229.393z" />
                                                </svg>
                                            </div>
                                            <ul tabIndex={0} className="dropdown-content menu bg-gray-900/95 rounded-lg z-10 w-40 p-2 shadow-xl border border-gray-700">
                                                <li><button className="text-gray-200 hover:bg-gray-800" onClick={() => onEditMessage(message)}>Edit</button></li>
                                                <li><button className="text-gray-200 hover:bg-gray-800" onClick={() => onDeleteMessage(message)}>Delete</button></li>
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Chat Footer */}
                                {isSender && (
                                    <div className="chat-footer text-xs text-gray-400 mt-1">
                                        {message.isMessageSent ? (
                                            message.isMessageReceived ? (
                                                message.isMessageSeen ? (
                                                    <span className="text-green-400">Seen</span>
                                                ) : (
                                                    <span className="text-blue-400">Received</span>
                                                )
                                            ) : (
                                                "Sent"
                                            )
                                        ) : (
                                            <span className="text-red-400">Not Sent</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-gray-300 text-lg font-medium">No messages yet!</span>
                </div>
            )}
            <div ref={endMessageRef} />
        </div>
    );
}