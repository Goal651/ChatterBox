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


export default function Dashboard({ serverUrl }: { serverUrl: string }) {
    const socket = useSocketConfig();
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([])

    // Fetch data and initialize state
    useEffect(() => {
        const fetchInitialData = async () => {
            const usersData = await getUsersApi(serverUrl);
            const currentUserData = await getProfileApi(serverUrl);
            const sortedUsers = sortUsersByLatestMessage(usersData);
            setUsers(sortedUsers);
            setCurrentUser(currentUserData);

            sessionStorage.setItem('users', JSON.stringify(sortedUsers));
            sessionStorage.setItem('currentUser', JSON.stringify(currentUserData));
        };
        fetchInitialData();
    }, [serverUrl]);

    // Socket event handlers
    useEffect(() => {
        if (!socket) return;

        const handleSocketMessage = (message: Message) => updateUserMessage(message);
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value.toLowerCase());

    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm));

    return (
        <div className="bg-slate-700 h-screen p-3 flex space-x-4 overflow-hidden">
            <div className="w-fit sm:w-fit xl:w-64 bg-blue-600 p-4 sm:p-8 rounded md:rounded-2xl overflow-y-auto">
                <Navigator socket={socket} initialCurrentUser={currentUser} />
            </div>
            <div className="w-1/3 bg-transparent rounded-2xl flex flex-col space-y-4">
                <SearchInput searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                <UserLists
                    filteredUsers={filteredUsers}
                    currentUser={currentUser}
                    onlineUsers={onlineUsers}
                    typingUsers={typingUsers}
                    socket={socket}
                    handleSetUnreads={handleSetUnreads}
                />
            </div>
            <div className="w-2/3 bg-black py-4 px-6 rounded-2xl flex flex-col">
                <ChatScreen
                    socket={socket}
                    users={filteredUsers}
                    serverUrl={serverUrl}
                    sentMessage={updateUsers}
                    onlineUsers={onlineUsers}
                />
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

const UserLists = ({ filteredUsers, currentUser, onlineUsers, typingUsers, socket, handleSetUnreads }: { filteredUsers: User[]; currentUser: User | null; onlineUsers: string[], typingUsers: string[], socket: Socket, handleSetUnreads: (newUnreads: Message[]) => void }) => (
    <div className="grid grid-rows-2 w-full space-y-4 overflow-y-auto overflow-x-hidden h-full">
        <div className="bg-black rounded-2xl overflow-x-hidden">
            <GroupContent />
        </div>
        <div className="bg-black rounded-2xl overflow-hidden">
            <FriendContent
                unreads={currentUser?.unreads}
                initialFriends={filteredUsers}
                onlineUsers={onlineUsers}
                typingUsers={typingUsers}
                socket={socket}
                setUnreads={handleSetUnreads}
            />
        </div>
    </div>
);
