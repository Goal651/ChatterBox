import { FaSearch } from "react-icons/fa";
import Navigator from "../content/Navigator";
import GroupContent from "../content/GroupContent";
import FriendContent from "../content/FriendContent";
import { getProfileApi, getUsersApi } from "../api/api";
import { useEffect, useState } from "react";
import { Message, User } from "../interfaces/interfaces";
import ChatScreen from "../content/ChatScreen";
import useSocketConfig from "../config/SocketConfig";
import { Socket } from "socket.io-client";
import Notifier from "../utilities/Notifier";
import { useParams } from "react-router-dom";

interface DashboardProps {
    serverUrl: string;
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
}

interface UserListProps {
    filteredUsers: User[];
    currentUser: User | null;
    onlineUsers: string[],
    typingUsers: string[],
    socket: Socket,
    handleSetUnreads: (newUnreads: Message[]) => void
    loading: boolean
}


export default function Dashboard({ serverUrl, mediaType }: DashboardProps) {
    const socket = useSocketConfig();
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([])
    const { friendId } = useParams()
    const [loading, setLoading] = useState(true)

    // Fetch data and initialize state
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true)
            const usersData = await getUsersApi(serverUrl);
            const currentUserData = await getProfileApi(serverUrl);
            const sortedUsers = sortUsersByLatestMessage(usersData);
            setUsers(sortedUsers);
            setCurrentUser(currentUserData);
            sessionStorage.setItem('users', JSON.stringify(sortedUsers));
            sessionStorage.setItem('currentUser', JSON.stringify(currentUserData));
            setLoading(false)
        };
        fetchInitialData();
    }, [serverUrl]);

    // Socket event handlers
    useEffect(() => {
        if (!socket) return;

        const handleSocketMessage = (message: Message) => {
            if (!message) return;

            // Find the sender's username
            const senderUser = users.find(user => user._id === message.sender);
            const senderUsername = senderUser ? senderUser.username : "Unknown User";

            // Pass the username and message to the Notifier
            Notifier({ from: senderUsername, message: message.message, users });

            // Update user messages
            updateUserMessage(message);
        };

        const handleReceivedMessage = ({ messageId }: { messageId: string }) => markMessageAsReceived(messageId);
        const handleSeenMessage = ({ messageId }: { messageId: string }) => markMessageAsSeen(messageId);
        const handleOnlineUsers = (users: string[]) => {
            setOnlineUsers([]);
            setOnlineUsers(users);
        }
        const handleSentMessage = (data: { message: Message }) => updateUsers(data.message)
        const handleReceiveSentMessage = (data: Message) => updateUsers(data)

        const handleTypingUsers = (data: { typingUserId: string }) => {
            setTypingUsers(prev => {
                if (prev.includes(data.typingUserId)) return prev;
                return [...prev, data.typingUserId];
            });
        };

        const handleStoppedTypingUsers = (data: { typingUserId: string }) => {
            setTypingUsers(prev => prev.filter(id => id !== data.typingUserId));
        };


        socket.on("messageSent", handleSentMessage);
        socket.on("receiveSentMessage", handleReceiveSentMessage)
        socket.on("messageReceived", handleReceivedMessage);
        socket.on("receiveMessage", handleSocketMessage)
        socket.on("messageSeen", handleSeenMessage);
        socket.on("onlineUsers", handleOnlineUsers);
        socket.on("userTyping", handleTypingUsers)
        socket.on("userNotTyping", handleStoppedTypingUsers)

        return () => {
            socket.off("messageSent", handleSocketMessage);
            socket.off("messageReceived", handleReceivedMessage);
            socket.off("messageSeen", handleSeenMessage);
            socket.off("onlineUsers", handleOnlineUsers);
            socket.off("userTyping", handleTypingUsers)
            socket.off("userNotTyping", handleStoppedTypingUsers)
        }
    }, [socket]);

    // Helper functions
    const sortUsersByLatestMessage = (users: User[]): User[] => {
        return users.sort((a, b) => {
            const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
            const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    };

    const updateUserMessage = (message: Message) => {
        if (!message) return;
        setUsers(prevUsers =>
            sortUsersByLatestMessage(prevUsers.map(user =>
                user._id === message.sender ? { ...user, latestMessage: message } : user
            ))
        );
    };

    const updateUsers = (message: Message) => {
        if (!message) return;
        setUsers(prevUsers =>
            sortUsersByLatestMessage(prevUsers.map(user =>
                user._id === message.receiver ? { ...user, latestMessage: message } : user
            ))
        );
    }

    const markMessageAsReceived = (messageId: string) => {
        setUsers(prevUsers =>
            sortUsersByLatestMessage(prevUsers.map(user => {
                if (user.latestMessage?._id === messageId) {
                    return { ...user, latestMessage: { ...user.latestMessage, isMessageReceived: true } };
                }
                return user;
            }))
        );
    };

    const markMessageAsSeen = (messageId: string) => {
        setUsers(prevUsers =>
            sortUsersByLatestMessage(prevUsers.map(user => {
                if (user.latestMessage?._id === messageId) {
                    return { ...user, latestMessage: { ...user.latestMessage, isMessageSeen: true } };
                }
                return user;
            }))
        );
    };

    const handleSetUnreads = (data: Message[]) => {
        if (!data) return
        setCurrentUser((prev): User | null => {
            if (!prev) return prev
            const newUser = { ...prev, unreads: data }
            return newUser
        })
    }

    const hideUsers = (): boolean => {
        if (mediaType.isDesktop) return false;
        else if (mediaType.isTablet) {
            if (friendId) return true
            else return false
        }
        else if (mediaType.isMobile) {
            if (friendId) return true
            else return false
        }
        else return false
    }

    const hideChatScreen = (): boolean => {
        if (mediaType.isDesktop) return false;
        else if (mediaType.isTablet) {
            if (friendId) return false
            else return true
        }
        else if (mediaType.isMobile) {
            if (friendId) return false
            else return true
        }
        else return false
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value.toLowerCase());

    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm));

    return (
        <div className={`flex ${mediaType.isMobile ? 'flex-col-reverse gap-4 p-2' : 'space-x-4 p-3'} bg-slate-700 h-screen  overflow-hidden`}>
            <div className={`${mediaType.isMobile ? 'w-full h-fit rounded-xl' : 'w-fit'}  xl:w-64 bg-blue-600 p-4 sm:p-8 rounded md:rounded-2xl overflow-y-auto`}>
                <Navigator
                    socket={socket}
                    initialCurrentUser={currentUser}
                    mediaType={mediaType} />
            </div>
            <div className={`overflow-hidden w-full flex  space-x-2 h-full ${mediaType.isMobile && ''}`}>
                {!hideUsers() && (
                    <div className={`${mediaType.isMobile ? 'w-full' : 'w-1/3'} bg-transparent rounded-2xl flex flex-col space-y-4 h-full`}>
                        <SearchInput
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                        />
                        <UserLists
                            filteredUsers={filteredUsers}
                            currentUser={currentUser}
                            onlineUsers={onlineUsers}
                            typingUsers={typingUsers}
                            socket={socket}
                            handleSetUnreads={handleSetUnreads}
                            loading={loading}
                        />
                    </div>
                )}
                {hideChatScreen() ? null : (
                    <div className={`${mediaType.isMobile || mediaType.isTablet ? 'w-full rounded-xl' : 'w-2/3 rounded-2xl'} bg-black py-2 px-2 sm:px-8  flex flex-col`}>
                        <ChatScreen
                            socket={socket}
                            users={filteredUsers}
                            serverUrl={serverUrl}
                            sentMessage={updateUsers}
                            onlineUsers={onlineUsers}
                            mediaType={mediaType}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

const SearchInput = ({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="flex bg-black w-full h-fit rounded-xl md:p-1 lg:p-2 xl:p-3 space-x-6">
        <div className="w-8 h-8">
            <FaSearch className="text-white" size={"100%"} />
        </div>
        <input
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={onSearchChange}
            className="bg-transparent w-full placeholder:text-gray-600 outline-0 text-white"
        />
    </div>
);

const UserLists = ({ filteredUsers, currentUser, onlineUsers, typingUsers, socket, handleSetUnreads, loading }: UserListProps) => (
    <div className="w-full space-y-4 overflow-hidden h-full">
        <div className="bg-black rounded-2xl h-full overflow-y-auto">
            {!loading ? (
                <>
                    <GroupContent />
                    <FriendContent
                        unreads={currentUser?.unreads}
                        initialFriends={filteredUsers}
                        onlineUsers={onlineUsers}
                        typingUsers={typingUsers}
                        socket={socket}
                        setUnreads={handleSetUnreads}
                    />
                </>
            ) : (
                <div className="flex justify-center items-center h-full text-white text-lg">
                    loading  <span className="ml-2 loading loading-bars"/>
                    </div>
            )}
        </div>
    </div>
);
