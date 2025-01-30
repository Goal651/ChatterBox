import { FaSearch } from "react-icons/fa";
import Navigator from "../content/Navigator";
import GroupContent from "../content/GroupContent";
import FriendContent from "../content/FriendContent";
import { getProfileApi, getUsersApi } from "../api/api";
import { useEffect, useState } from "react";
import { DashboardProps, Message, Photos, User, UserListProps } from "../interfaces/interfaces";
import ChatScreen from "../content/ChatScreen";
import Notifier from "../utilities/Notifier";
import { useNavigate, useParams } from "react-router-dom";
import Setting from "../content/Settings";
import CreateGroup from "../content/CreateGroup";
import Notifications from "../content/Notifications";
import PusherManager from '../config/PusherManager'
import NotificationRequest from "../utilities/Permissions";
import CallComponent from "../components/CallComponent";


export default function Dashboard({ serverUrl, mediaType, socket }: DashboardProps) {
    const navigate = useNavigate()
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([])
    const { friendId, sessionType } = useParams()
    const [loading, setLoading] = useState(true)
    const [photos, setPhotos] = useState<Photos[]>([]);
    const [isOutgoingCall, setIsOutgoingCall] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [isVideoCall, setIsVideoCall] = useState(false);

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

        const handleSocketMessage = ({ message, senderUserName }: { message: Message, senderUserName: string }) => {
            if (!message) return;
            Notifier({ from: senderUserName, message: message.message, users });

            // Update user messages
            updateUserMessage(message);
        };

        const handleReceivedMessage = ({ messageId }: { messageId: string }) => markMessageAsReceived(messageId);
        const handleSeenMessage = ({ messageId }: { messageId: string }) => markMessageAsSeen(messageId);
        const handleOnlineUsers = (users: string[]) => {
            setOnlineUsers(users);
        }
        const handleSentMessage = (data: { message: Message }) => updateUsers(data.message)
        const handleReceiveSentMessage = (data: Message) => {
            console.log(data); updateUsers(data)
        }

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

    const storePhotos = (data: Photos) => {
        setPhotos((prev): Photos[] => {
            if (prev.length <= 0) return [data]
            const doesPhotoExists = prev.filter(photo => photo.key === data.key)[0]
            if (doesPhotoExists) return prev
            return [...prev, data]
        })

    }

    const handleCallCancellation = () => {
        setIsIncomingCall(false)
        setIsOutgoingCall(false)
        setIsVideoCall(false)
    }


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value.toLowerCase());

    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm));

    function chattingScreen() {
        return (
            <>
                <PusherManager serverUrl={serverUrl} />
                <NotificationRequest />
                {!hideUsers() && (
                    <div className={`${mediaType.isMobile || mediaType.isTablet ? 'w-full' : 'w-1/3'} bg-transparent rounded-2xl flex flex-col space-y-4 h-full`}>
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
                            navigate={navigate}
                            serverUrl={serverUrl}
                            imageLoaded={storePhotos}
                            photos={photos}
                        />
                    </div>
                )}
                {hideChatScreen() ? null : (
                    <div className={`${mediaType.isMobile || mediaType.isTablet ? 'w-full rounded-xl' : 'w-2/3 rounded-2xl'} bg-slate-950 py-2 px-2 sm:px-8  flex flex-col`}>
                        <ChatScreen
                            socket={socket}
                            users={filteredUsers}
                            serverUrl={serverUrl}
                            sentMessage={updateUsers}
                            onlineUsers={onlineUsers}
                            mediaType={mediaType}
                            loadedImage={storePhotos}
                            photos={photos}
                        />
                    </div>
                )}
            </>)
    }


    const renderScreen = () => {
        switch (sessionType) {
            case 'chat':
                return chattingScreen()

            case 'setting':
                return <Setting
                    serverUrl={serverUrl}
                    userData={currentUser}
                    loadedImage={storePhotos}
                    photos={photos} />

            case 'create-group':
                return <CreateGroup
                    socket={socket}
                    userList={filteredUsers}
                    mediaType={mediaType}
                    serverUrl={serverUrl}
                />

            case 'notification':
                return <Notifications />

            default:
                break;
        }
    }


    return (
        <div className={`flex ${mediaType.isMobile ? 'flex-col-reverse gap-4 p-2' : 'space-x-4 p-3'} bg-slate-700 h-screen  overflow-hidden`}>
            <CallComponent
                users={users}
                isVideoCall={isVideoCall}
                socket={socket}
                isOutgoingCall={isOutgoingCall}
                isIngoingCall={isIncomingCall}
                isUserCalling={false}
                onCancel={handleCallCancellation}
                callEnded={handleCallCancellation}
            />
            <div className={`${mediaType.isMobile ? 'w-full h-fit rounded-xl' : 'w-fit'}  xl:w-64 bg-blue-800 p-4 sm:p-8 rounded md:rounded-2xl overflow-y-auto`}>
                <Navigator
                    socket={socket}
                    initialCurrentUser={currentUser}
                    mediaType={mediaType}
                    serverUrl={serverUrl}
                    loadedImage={storePhotos}
                    photos={photos} />

            </div>
            <div className={`overflow-hidden w-full flex  space-x-2 h-full ${mediaType.isMobile && ''}`}>
                {renderScreen()}
            </div>
        </div>
    );
}

const SearchInput = ({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="flex bg-slate-950 w-full h-fit rounded-xl p-2 lg:p-2 xl:p-3 space-x-6">
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

const UserLists = ({ filteredUsers, currentUser, onlineUsers, typingUsers, socket, handleSetUnreads, loading, navigate, serverUrl, imageLoaded, photos }: UserListProps) => (
    <div className="w-full space-y-4 overflow-hidden h-full">
        <div className="bg-slate-950 rounded-2xl h-full overflow-y-auto">
            {!loading ? (
                <div className="flex flex-col justify-evenly">
                    <button
                        onClick={() => navigate('/create-group')}
                        className="flex border-0 mt-4 btn mx-auto bg-blue-500 text-white hover:bg-blue-700 ">
                        Create new group
                    </button>
                    <GroupContent />
                    <FriendContent
                        unreads={currentUser?.unreads}
                        initialFriends={filteredUsers}
                        onlineUsers={onlineUsers}
                        typingUsers={typingUsers}
                        socket={socket}
                        setUnreads={handleSetUnreads}
                        serverUrl={serverUrl}
                        images={imageLoaded}
                        photos={photos}
                    />
                </div>
            ) : (
                <div className="flex justify-center items-center h-full text-white text-lg">
                    loading  <span className="ml-2 loading loading-bars" />
                </div>
            )}
        </div>
    </div>
);
