import { useNavigate } from "react-router-dom";
import { FriendContentProps, User } from "../interfaces/interfaces";
import { useEffect, useState } from "react";
import ProfilePicturePreview from "../utilities/ProfilePicturePreview";

export default function FriendContent({ initialFriends, unreads, onlineUsers, typingUsers, socket, setUnreads, serverUrl, images, photos, loading }: FriendContentProps) {
    const navigate = useNavigate();
    const [friends, setFriends] = useState<User[]>(initialFriends);
    const [unreadMessages, setUnreadMessages] = useState(unreads);

    useEffect(() => {
        if (initialFriends) setFriends(initialFriends);
        if (unreads) setUnreadMessages(unreads);
    }, [initialFriends, unreads]);

    const handleFriendClick = (id: string) => {
        navigate(`/chat/${id}`);
        if (!unreadMessages) return;
        const unread = unreadMessages.filter(m => m.sender === id);
        if (unread.length <= 0) return;
        setUnreadMessages(prev => prev?.filter(dm => dm.sender !== id));
        setUnreads(unreadMessages?.filter(dm => dm.sender !== id));
        if (socket) socket.emit('markMessageAsRead', unread.map(m => m._id));
    };

    const findNumberOfUnreads = (id: string): number => {
        if (!id || !unreadMessages?.length) return 0;
        return unreadMessages.filter(m => m.sender === id).length;
    };

    const renderFriendStatus = (friend: User) => {
        const unreadCount = findNumberOfUnreads(friend._id);
        if (unreadCount === 0) {
            if (friend?.latestMessage?.receiver === friend._id) {
                return friend.latestMessage.isMessageSent ? (
                    <div className="flex flex-col items-end text-2xl leading-none">
                        <span className={`${friend.latestMessage.isMessageSeen ? 'text-blue-400' : 'text-gray-400'}`}>✓</span>
                        {friend.latestMessage.isMessageReceived && <span className={`${friend.latestMessage.isMessageSeen ? 'text-blue-400' : 'text-gray-400'} -mt-2`}>✓</span>}
                    </div>
                ) : (
                    <span className="text-red-400 text-xl">✗</span>
                );
            }
        } else {
            return (
                <div className="flex justify-end">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md">
                        {unreadCount}
                    </div>
                </div>
            );
        }
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-950/95 rounded-2xl shadow-inner">
            <svg className="animate-spin h-12 w-12 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
            </svg>
            <span className="mt-4 text-gray-300 text-lg font-medium">Loading friends...</span>
        </div>
    );

    if (friends.length <= 0) return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-950/95 rounded-2xl shadow-inner">
            <span className="text-gray-300 text-lg font-medium">No friends available</span>
        </div>
    );

    return (
        <div className="bg-gray-950/95 p-4 flex flex-col space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-2xl shadow-inner">
            {friends.map((friend) => (
                <div
                    key={friend._id}
                    onClick={() => handleFriendClick(friend._id)}
                    className="w-full py-3 px-2 rounded-lg hover:bg-gray-900/80 transition-all duration-200 cursor-pointer"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-12 h-12">
                                    <ProfilePicturePreview
                                        profilePicture={friend.image}
                                        serverUrl={serverUrl}
                                        loadedImage={images}
                                        photos={photos}
                                        username={friend.username}
                                        textSize="text-2xl"
                                        className="shadow-md"
                                    />
                                </div>
                                {onlineUsers.includes(friend._id) && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950" />
                                )}
                            </div>
                            <div className="max-w-xs">
                                <div className="text-gray-200 font-semibold text-lg truncate">{friend.username}</div>
                                {typingUsers.some(x => x === friend._id) ? (
                                    <div className="text-green-400 text-sm truncate">Typing...</div>
                                ) : (friend.latestMessage && friend.latestMessage.sender === friend._id ? (
                                    <div className="text-gray-400 text-sm truncate">
                                        {friend.latestMessage?.message ? (
                                            friend.latestMessage.type === 'file' ? 'Sent a file' : friend.latestMessage.message
                                        ) : 'Say hey to your new friend'}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-sm truncate">
                                        {friend.latestMessage?.message ? (
                                            friend.latestMessage.type === 'file' ? 'You: Sent a file' : `You: ${friend.latestMessage.message}`
                                        ) : 'Say hey to your new friend'}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                            <div className="text-gray-400 text-xs">{new Date(friend.lastActiveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            {renderFriendStatus(friend)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}