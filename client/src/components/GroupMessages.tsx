import { useParams } from "react-router-dom";
import { GroupMessagesProps, User } from "../interfaces/interfaces";
import FilePreview from "../utilities/FilePreview";
import { useCallback, useEffect, useRef } from "react";
import ProfilePicturePreview from "../utilities/ProfilePicturePreview";


export default function GroupMessages({ messages, mediaType, serverUrl,photos,images }: GroupMessagesProps) {
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
                    const isSender = message.sender._id === currentUser._id;
                    const bubbleClass = isSender ? "bg-blue-600" : "bg-gray-900";
                    return (
                        <div key={message._id}>
                            <div className={`chat ${isSender ? "chat-end " : "chat-start"} max-h-full w-full`}>
                                {!isSender && (
                                    <div className="chat-image">
                                        <div className="w-12 h-12">
                                            <ProfilePicturePreview
                                                profilePicture={message.sender.image}
                                                serverUrl={serverUrl}
                                                loadedImage={images}
                                                photos={photos}
                                                />
                                        </div>
                                    </div>
                                )}
                                <div className={`chat-bubble rounded-lg break-words min-w-20 ${bubbleClass} ${mediaType.isMobile ? "max-w-full" : "max-w-96 "}`}>
                                    {!isSender && (
                                        <div className=" mb-2 text-md font-semibold text-blue-500">
                                            {message.sender.username}
                                        </div>
                                    )}
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
                                {isSender && (
                                    <div className="chat-footer text-gray-500">
                                        { }
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
        </div >
    )
}