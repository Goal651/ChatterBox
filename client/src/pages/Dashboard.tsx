import Navigator from "../screens/Navigator";
import GroupContent from "../screens/GroupContent";
import FriendContent from "../screens/FriendContent";
import { getProfileApi, getUsersApi } from "../api/UserApi";
import { useEffect, useState } from "react";
import { DashboardProps, Group, GroupMessage, Message, Notification, Photos, User, UserGroupListProps } from "../interfaces/interfaces";
import ChatScreen from "../screens/ChatScreen";
import Notifier from "../utilities/Notifier";
import { useNavigate, useParams } from "react-router-dom";
import Setting from "../screens/Settings";
import CreateGroup from "../screens/CreateGroup";
import Notifications from "../screens/Notifications";
import PusherManager from '../config/PusherManager';
import NotificationRequest from "../utilities/Permissions";
import CallComponent from "../components/CallComponent";
import { getGroupsApi } from "../api/GroupApi";
import { getNotification } from "../api/NotificationApi";
import GroupSetting from "../components/GroupSetting";

export default function Dashboard({ serverUrl, mediaType, socket }: DashboardProps) {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { componentId, sessionType, setting } = useParams();
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState<Photos[]>([]);
    const [isOutgoingCall, setIsOutgoingCall] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [isVideoCall, setIsVideoCall] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const usersData = await getUsersApi(serverUrl);
                const currentUserData = await getProfileApi(serverUrl);
                const initialGroups = await getGroupsApi(serverUrl);
                const initialNotifications = await getNotification(serverUrl);
                const sortedUsers = sortUsersByLatestMessage(usersData);
                const sortedGroups = sortGroupsByLatestMessage(initialGroups.groups);
                setUsers(sortedUsers);
                setCurrentUser(currentUserData);
                setGroups(sortedGroups);
                setNotifications(initialNotifications.notifications);
                sessionStorage.setItem('users', JSON.stringify(sortedUsers));
                sessionStorage.setItem('currentUser', JSON.stringify(currentUserData));
                sessionStorage.setItem('groups', JSON.stringify(sortedGroups));
                sessionStorage.setItem('notifications', JSON.stringify(initialNotifications.notifications));
                setLoading(false);
            } catch (err) {
                console.error("Error fetching initial data:", err);
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [serverUrl]);

    useEffect(() => {
        if (!socket) return;

        const handleSocketMessage = ({ message, senderUserName }: { message: Message, senderUserName: string }) => {
            if (!message) return;
            Notifier({ from: senderUserName, message: message.message, users, title: 'New message' });
            updateUserMessage(message);
        };

        const handleReceivedMessage = ({ messageId }: { messageId: string }) => markMessageAsReceived(messageId);
        const handleSeenMessage = ({ messageId }: { messageId: string }) => markMessageAsSeen(messageId);
        const handleOnlineUsers = (users: string[]) => setOnlineUsers(users);
        const handleSentMessage = (data: { message: Message }) => updateUsers(data.message);
        const handleReceiveSentMessage = (data: Message) => updateUsers(data);

        const handleTypingUsers = (data: { typingUserId: string }) => {
            setTypingUsers(prev => {
                if (prev.includes(data.typingUserId)) return prev;
                return [...prev, data.typingUserId];
            });
        };

        const handleStoppedTypingUsers = (data: { typingUserId: string }) => {
            setTypingUsers(prev => prev.filter(id => id !== data.typingUserId));
        };

        const handleReceiveGroupMessage = ({ message, groupName, senderName }: { message: GroupMessage, groupName: string, senderName: string }) => {
            if (!message) return;
            Notifier({ from: senderName, message: message.message, users, title: groupName });
        };

        socket.on("messageSent", handleSentMessage);
        socket.on("receiveSentMessage", handleReceiveSentMessage);
        socket.on("messageReceived", handleReceivedMessage);
        socket.on("receiveMessage", handleSocketMessage);
        socket.on("messageSeen", handleSeenMessage);
        socket.on("onlineUsers", handleOnlineUsers);
        socket.on("userTyping", handleTypingUsers);
        socket.on("userNotTyping", handleStoppedTypingUsers);
        socket.on("receiveGroupMessage", handleReceiveGroupMessage);

        return () => {
            socket.off("messageSent", handleSentMessage);
            socket.off("receiveSentMessage", handleReceiveSentMessage);
            socket.off("messageReceived", handleReceivedMessage);
            socket.off("receiveMessage", handleSocketMessage);
            socket.off("messageSeen", handleSeenMessage);
            socket.off("onlineUsers", handleOnlineUsers);
            socket.off("userTyping", handleTypingUsers);
            socket.off("userNotTyping", handleStoppedTypingUsers);
            socket.off("receiveGroupMessage", handleReceiveGroupMessage);
        };
    }, [socket]);

    // Helper functions
    const sortUsersByLatestMessage = (users: User[]) => {
        return users.sort((a, b) => {
            const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
            const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    };

    const sortGroupsByLatestMessage = (groups: Group[]) => {
        return groups.sort((a, b) => {
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
    };

    const updateGroups = (message: GroupMessage) => {
        if (!message) return;
        setGroups(prevUsers =>
            sortGroupsByLatestMessage(
                prevUsers.map(group =>
                    group._id === message.group ? { ...group, latestMessage: message } : group
                )
            )
        );
    };

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
        if (!data) return;
        setCurrentUser((prev): User | null => {
            if (!prev) return prev;
            const newUser = { ...prev, unreads: data };
            return newUser;
        });
    };

    const hideUsers = (): boolean => {
        if (mediaType.isDesktop) return false;
        else if (mediaType.isTablet) {
            if (componentId) return true;
            else return false;
        }
        else if (mediaType.isMobile) {
            if (componentId) return true;
            else return false;
        }
        else return false;
    };

    const hideChatScreen = (): boolean => {
        if (mediaType.isDesktop) return false;
        else if (mediaType.isTablet) {
            if (componentId) return false;
            else return true;
        }
        else if (mediaType.isMobile) {
            if (componentId) return false;
            else return true;
        }
        else return false;
    };

    const storePhotos = (data: Photos) => {
        setPhotos((prev): Photos[] => {
            if (prev.length <= 0) return [data];
            const doesPhotoExists = prev.filter(photo => photo.key === data.key)[0];
            if (doesPhotoExists) return prev;
            return [...prev, data];
        });
    };

    const handleCallCancellation = () => {
        setIsIncomingCall(false);
        setIsOutgoingCall(false);
        setIsVideoCall(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value.toLowerCase());

    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm));
    const filteredGroups = groups.filter(group => group.groupName.toLowerCase().includes(searchTerm));

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
                        <UserGroupLists
                            filteredUsers={filteredUsers}
                            currentUser={currentUser}
                            onlineUsers={onlineUsers}
                            typingUsers={typingUsers}
                            groups={filteredGroups}
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
                    <div className={`${mediaType.isMobile || mediaType.isTablet ? 'w-full rounded-xl' : 'w-2/3 rounded-2xl'} bg-slate-950 py-2 px-2 sm:px-8  flex flex-col `}>
                        {setting === 'setting' ? (
                            <GroupSetting
                                groups={groups}
                                users={users}
                                serverUrl={serverUrl}
                            />
                        ) : (
                            <ChatScreen
                                socket={socket}
                                groups={groups}
                                users={filteredUsers}
                                serverUrl={serverUrl}
                                sentMessage={updateUsers}
                                onlineUsers={onlineUsers}
                                mediaType={mediaType}
                                loadedImage={storePhotos}
                                photos={photos}
                                sentGroupMessage={updateGroups}
                            />)}
                    </div>
                )}
            </>)
    }

    const renderScreen = () => {
        switch (sessionType) {
            case 'chat':
                return chattingScreen();
            case 'group':
                return chattingScreen();
            case 'setting':
                return <Setting
                    serverUrl={serverUrl}
                    userData={currentUser}
                    loadedImage={storePhotos}
                    photos={photos} />;
            case 'create-group':
                return <CreateGroup
                    socket={socket}
                    userList={filteredUsers}
                    mediaType={mediaType}
                    serverUrl={serverUrl}
                />;
            case 'notification':
                return <Notifications
                    notification={notifications} />;
            default:
                return null;
        }
    };

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
            <div className={`${mediaType.isMobile ? 'w-full h-fit rounded-xl' : 'w-fit'}  xl:w-64 bg-slate-950 p-4 sm:p-8 rounded md:rounded-2xl overflow-y-auto`}>
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

const SearchInput = ({ searchTerm, onSearchChange }: { searchTerm: string, onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="w-full input input-xl bg-slate-950 rounded-xl">
        <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24">
            <g strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
            </g>
        </svg>
        <input
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={onSearchChange}
            className="grow"
        />
        <kbd className="kbd kbd-sm">⌘</kbd>
        <kbd className="kbd kbd-sm">K</kbd>
    </div>
);

const UserGroupLists = ({ filteredUsers, currentUser, onlineUsers, typingUsers, socket, handleSetUnreads, loading, navigate, serverUrl, imageLoaded, photos, groups }: UserGroupListProps) => (
    <div className="w-full space-y-4 overflow-hidden h-full">
        <div className="bg-transparent  h-full overflow-y-auto">
            <div className="flex flex-col justify-center h-full w-full gap-y-12 z-10 ">
                <div className="rounded-2xl bg-slate-950 h-1/2 w-full overflow-y-auto ">
                    <div className="mt-4 flex w-full justify-between  items-center px-10">
                        <div className="text-2xl font-bold text-slate-300">
                            Groups
                        </div>
                        <button
                            onClick={() => navigate('/create-group')}
                            className="rounded-lg btn text-white ">
                            ➕ New
                        </button>
                    </div>
                    <GroupContent
                        groups={groups}
                        socket={socket}
                        images={imageLoaded}
                        photos={photos}
                        serverUrl={serverUrl}
                        loading={loading}
                    />
                </div>
                <div className="rounded-3xl bg-slate-950 h-1/2 w-full overflow-y-auto shadow-lg shadow-blue-500">
                    <div className="mt-4 px-10 text-2xl font-bold text-slate-300 ">
                        Friends
                    </div>
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
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    </div>
);
