import { useNavigate } from "react-router-dom";
import { Message, User } from "../interfaces/interfaces";
import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";

interface FriendContentProps {
    initialFriends: User[];
    unreads?: Message[] | null;
    onlineUsers: string[]
    typingUsers: string[]
    socket: Socket
    setUnreads: (data: Message[]) => void
}

export default function FriendContent({ initialFriends, unreads, onlineUsers, typingUsers, socket, setUnreads }: FriendContentProps) {
    const navigate = useNavigate();
    const [friends, setFriends] = useState(initialFriends)
    const [unreadMessages, setUnreadMessages] = useState(unreads)

    useEffect(() => {
        if (!initialFriends) return
        setFriends(initialFriends)
        if (!unreads) return
        setUnreadMessages(unreads)
    }, [initialFriends, unreads])

    const handleFriendClick = (id: string) => {
        navigate(`/chat/${id}`)
        if (!unreadMessages) return
        const unread = unreadMessages.filter(m => m.sender === id)
        if (unread.length <= 0) return
        setUnreadMessages(prev => prev?.filter(dm => dm.sender !== id))
        setUnreads(unreadMessages?.filter(dm => dm.sender !== id))
        if (socket) {
            socket.emit('markMessageAsRead', unread.map(m => m._id))
        }
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
                    <div className={`${friend.latestMessage.isMessageSeen ? 'text-blue-500' : 'text-white-500'} text-3xl text-right`}>
                        <div>✓</div>
                        {friend.latestMessage.isMessageReceived && <div className="relative bottom-8">✓</div>}
                    </div>
                ) : (
                    <div className="text-right text-error">✗</div>
                );
            }
        } else {
            return (
                <div className="flex justify-end">
                    <div className="flex items-center w-8 h-8 p-1 bg-blue-500 rounded-full text-center text-black">
                        <div className="text-center w-full">{unreadCount}</div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="bg-transparent p-4 flex flex-col space-y-4  overflow-x-hidden">
            {friends?.length ? (
                friends.map((friend) => (
                    <div key={friend._id} onClick={() => handleFriendClick(friend._id)} className="w-full py-4">
                        <div className="flex justify-between">
                            <div className="flex space-x-4">
                                <div>
                                    <img
                                        src="/image.png"
                                        alt="Friend Avatar"
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                    {onlineUsers.includes(friend._id) && (
                                        <div className="relative bottom-4 left-10 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                                    )}
                                </div>
                                <div className="w-52 ">
                                    <div className="text-white font-semibold text-lg">{friend.username}</div>
                                    {typingUsers.some(x => x === friend._id) ? (
                                        <div className="text-green-400 line-clamp-1 max-w-52">
                                            typing...
                                        </div>
                                    ) : (friend.latestMessage && friend.latestMessage.sender == friend._id ? (
                                        <div className="text-gray-400 line-clamp-1 max-w-52">
                                            {friend.latestMessage?.message ? (
                                                friend.latestMessage.type === 'file' ? 'sent file' : friend.latestMessage.message
                                            ) : 'Say hey to your new friend'}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 line-clamp-1 max-w-52">
                                            {friend.latestMessage?.message ? (
                                                friend.latestMessage.type === 'file' ? 'you: sent file' : 'you: ' + friend.latestMessage.message
                                            ) : 'Say hey to your new friend'}
                                        </div>
                                    )
                                    )}
                                </div>
                            </div>
                            <div className="h-fit flex flex-col">
                                <div>{new Date(friend.lastActiveTime).toLocaleDateString('en-US', { hour: 'numeric', minute: 'numeric' })}</div>
                                {renderFriendStatus(friend)}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-white font-semibold text-xl">No friends available</div>
            )}
        </div>
    );
}
