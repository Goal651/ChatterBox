import { useParams } from "react-router-dom";
import { GroupMessagesProps, User } from "../../interfaces/interfaces";
import FilePreview from "./FilePreview";
import { useCallback, useEffect, useRef } from "react";
import ProfilePicturePreview from "./ProfilePicturePreview";

export default function GroupMessages({ messages, mediaType,  photos, images }: GroupMessagesProps) {
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
                    const isSender = message.sender._id === currentUser._id;
                    const bubbleClass = isSender ? "bg-blue-600/90" : "bg-gray-800/90";

                    return (
                        <div key={message._id} className={`flex w-full ${isSender ? "justify-end" : "justify-start"}`}>
                            <div className={`chat flex flex-col gap-1 max-w-[75%] ${isSender ? "items-end" : "items-start"}`}>
                                {!isSender && (
                                    <div className="chat-image mb-2">
                                        <div className="w-10 h-10 relative group">
                                            <ProfilePicturePreview
                                                profilePicture={message.sender.image}
                                                textSize="text-2xl"
                                                loadedImage={images}
                                                photos={photos}
                                                username={message.sender.username}
                                                className="rounded-full border-2 border-gray-700 transition-transform duration-200 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        </div>
                                    </div>
                                )}
                                <div className={`chat-bubble rounded-xl p-3 shadow-md break-words min-w-20 ${bubbleClass} ${mediaType.isMobile ? "max-w-full" : "max-w-md"} transition-all duration-200 hover:shadow-lg`}>
                                    {!isSender && (
                                        <div className="mb-1 text-sm font-semibold text-blue-400">{message.sender.username}</div>
                                    )}
                                    {message.type === 'text' ? (
                                        <div className="text-gray-100 text-sm">{message.message}</div>
                                    ) : (
                                        <div className={`${message.message.split(".").pop() === "mp3" ? "h-12 w-full" : "max-w-xs"} bg-transparent rounded-xl`}>
                                            <FilePreview files={message.message}  mediaType={mediaType} />
                                        </div>
                                    )}
                                </div>
                                {isSender && (
                                    <div className="chat-footer text-xs text-gray-400 mt-1">
                                        {message.isMessageSent ? "Sent" : <span className="text-red-400">Not Sent</span>}
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