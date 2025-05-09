import { useEffect, useState } from "react";
import ProfilePicturePreview from "./ProfilePicturePreview";
import { Message, UserGroupListProps,User, Group, GroupMessage } from "../../interfaces/interfaces";

export default function UserGroupList({
    filteredUsers,
    groups,
    currentUser,
    onlineUsers,
    typingUsers,
    socket,
    handleSetUnreads,
    loading,
    navigate,
    imageLoaded,
    photos,
}: UserGroupListProps) {
    const [friends, setFriends] = useState(filteredUsers);
    const [unreadMessages, setUnreadMessages] = useState<Message[]>(currentUser?.unreads || []);

    useEffect(() => {
        setFriends(filteredUsers);
        setUnreadMessages(currentUser?.unreads || []);
    }, [filteredUsers, currentUser]);

    const handleItemClick = (id: string, isGroup: boolean) => {
        if (isGroup) {
            socket.emit('connectGroup', { groupId: id });
            navigate(`/group/${id}`);
        } else {
            navigate(`/chat/${id}`);
            if (!unreadMessages.length) return;
            const unread = unreadMessages.filter(m => m.sender === id);
            if (unread.length > 0) {
                setUnreadMessages(prev => prev.filter(dm => dm.sender !== id));
                handleSetUnreads(unreadMessages.filter(dm => dm.sender !== id));
                socket.emit('markMessageAsRead', unread.map(m => m._id));
            }
        }
    };

    const findNumberOfUnreads = (id: string): number => {
        return unreadMessages.filter(m => m.sender === id).length;
    };

    const renderStatus = (item: User | Group, isGroup: boolean) => {
        if (isGroup) return null;

        const friend = item as User;
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

    const combinedList = [
        ...friends.map(f => ({ ...f, isGroup: false })),
        ...groups.map(g => ({ ...g, isGroup: true })),
    ].sort((a, b) => {
        const aTime = a.latestMessage ? new Date(a.latestMessage.createdAt).getTime() : 0;
        const bTime = b.latestMessage ? new Date(b.latestMessage.createdAt).getTime() : 0;
        return bTime - aTime; // Sort by latest message time, descending
    });

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-950/95 rounded-2xl shadow-inner">
            <svg className="animate-spin h-12 w-12 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
            </svg>
            <span className="mt-4 text-gray-300 text-lg font-medium">Loading...</span>
        </div>
    );

    if (combinedList.length === 0) return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-950/95 rounded-2xl shadow-inner">
            <span className="text-gray-300 text-lg font-medium">No friends or groups available</span>
        </div>
    );

    return (
        <div className="bg-transparent p-4 flex flex-col space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-2xl shadow-inner">
            {combinedList.map((item) => {
                const isGroup = item.isGroup;
                const id = item._id;
                const name = isGroup ? (item as Group).groupName : (item as User).username;

                return (
                    <div
                        key={id}
                        onClick={() => handleItemClick(id, isGroup)}
                        className="w-full py-3 px-2 rounded-lg hover:bg-gray-900/80 transition-all duration-200 cursor-pointer"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="w-12 h-12">
                                        <ProfilePicturePreview
                                            profilePicture={item.image}
                                            loadedImage={imageLoaded}
                                            photos={photos}
                                            username={name}
                                            textSize="text-2xl"
                                            className="shadow-md"
                                        />
                                    </div>
                                    {!isGroup && onlineUsers.includes(id) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950" />
                                    )}
                                </div>
                                <div className="max-w-xs">
                                    <div className="text-gray-200 font-semibold text-lg truncate">{name}</div>
                                    {isGroup ? (
                                        <div className="text-gray-400 text-sm truncate">
                                            {item.latestMessage ? (
                                                <span className="flex gap-x-1">
                                                    <span className="font-semibold text-blue-400">
                                                        {(item.latestMessage as GroupMessage).sender._id === currentUser?._id ? 'You' : (item.latestMessage as GroupMessage).sender.username}
                                                    </span>
                                                    <span>
                                                        {item.latestMessage.type === 'file' ? 'sent a file' : item.latestMessage.message}
                                                    </span>
                                                </span>
                                            ) : 'Say hey to your new group'}
                                        </div>
                                    ) : typingUsers.includes(id) ? (
                                        <div className="text-green-400 text-sm truncate">Typing...</div>
                                    ) : (
                                        <div className="text-gray-400 text-sm truncate">
                                            {item.latestMessage ? (
                                                item.latestMessage.sender === id ? (
                                                    item.latestMessage.type === 'file' ? 'Sent a file' : item.latestMessage.message
                                                ) : (
                                                    item.latestMessage.type === 'file' ? 'You: Sent a file' : `You: ${item.latestMessage.message}`
                                                )
                                            ) : 'Say hey to your new friend'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                                <div className="text-gray-400 text-xs">
                                    {item.latestMessage ? new Date(item.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                                {renderStatus(item, isGroup)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}