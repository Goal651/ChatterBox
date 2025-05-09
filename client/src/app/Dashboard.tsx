import Navigator from "./Navigator";
import { getProfileApi, getUsersApi } from "../api/UserApi";
import { useEffect, useState } from "react";
import { DashboardProps, Group, GroupMessage, Message, Notification,  User } from "../interfaces/interfaces";
import ChatScreen from "./ChatScreen";
import Notifier from "../components/shared/Notifier";
import { useNavigate, useParams } from "react-router-dom";
import Setting from "./Settings";
import CreateGroup from "./CreateGroup";
import Notifications from "../components/shared/Notifications";
import PusherManager from '../config/PusherManager';
import CallComponent from "../components/shared/CallComponent";
import { getGroupsApi } from "../api/GroupApi";
import { getNotification } from "../api/NotificationApi";
import GroupSetting from "../components/shared/GroupSetting";
import NotificationRequest from "../components/shared/Permissions";
import UserGroupList from "../components/shared/UserGroupList";

export default function Dashboard({ mediaType, socket }: DashboardProps) {
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
    const [isOutgoingCall, setIsOutgoingCall] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [isVideoCall, setIsVideoCall] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const usersData = await getUsersApi();
                const currentUserData = await getProfileApi();
                const initialGroups = await getGroupsApi();
                const initialNotifications = await getNotification();
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
    }, []);

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

    // Helper functions (unchanged for brevity)
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
                <PusherManager />
                <NotificationRequest />
                {!hideUsers() && (
                    <div className={`${mediaType.isMobile || mediaType.isTablet ? 'w-full' : 'w-1/3'} bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900  flex flex-col p-2 space-y-6 h-full shadow-lg transition-all duration-300`}>
                        <SearchInput
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                        />
                        <UserGroupList
                            filteredUsers={filteredUsers}
                            currentUser={currentUser}
                            onlineUsers={onlineUsers}
                            typingUsers={typingUsers}
                            groups={filteredGroups}
                            socket={socket}
                            handleSetUnreads={handleSetUnreads}
                            loading={loading}
                            navigate={navigate}
                        />
                    </div>
                )}
                {hideChatScreen() ? null : (
                    <div className={`${mediaType.isMobile || mediaType.isTablet ? 'w-full rounded-xl' : 'w-2/3 rounded-2xl'} bg-gray-950/95  flex flex-col shadow-xl transition-all duration-300`}>
                        {setting === 'setting' ? (
                            <GroupSetting
                                groups={groups}
                                users={users}

                            />
                        ) : (
                            <ChatScreen
                                socket={socket}
                                groups={groups}
                                users={filteredUsers}
                                sentMessage={updateUsers}
                                onlineUsers={onlineUsers}
                                mediaType={mediaType}
                                sentGroupMessage={updateGroups}
                            />
                        )}
                    </div>
                )}
            </>
        );
    }

    const renderScreen = () => {
        switch (sessionType) {
            case 'chat':
                return chattingScreen();
            case 'group':
                return chattingScreen();
            case 'setting':
                return <Setting userData={currentUser} />;
            case 'create-group':
                return <CreateGroup
                    socket={socket}
                    userList={filteredUsers}
                    mediaType={mediaType}

                />;
            case 'notification':
                return <Notifications
                    notification={notifications} />;
            default:
                return null;
        }
    };

    return (
        <div className={`flex ${mediaType.isMobile && 'flex-col-reverse '}  h-screen overflow-hidden`}>
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
            <div className={`${mediaType.isMobile ? 'w-full h-fit rounded-xl' : 'w-fit xl:w-72'} bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-10  shadow-lg transition-all duration-300 hover:shadow-xl`}>
                <Navigator
                    socket={socket}
                    initialCurrentUser={currentUser}
                    mediaType={mediaType}
                />
            </div>
            <div className={`overflow-hidden w-full flex h-full`}>
                {renderScreen()}
            </div>
        </div>
    );
}

const SearchInput = ({ searchTerm, onSearchChange }: { searchTerm: string, onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="relative w-full">
        <input
            type="search"
            placeholder="Search friends or groups..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full px-5 py-3 pl-12 bg-gray-800/80 text-gray-200 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-md"
        />
        <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
        </svg>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
            <kbd className="kbd kbd-sm bg-gray-700 text-gray-300">⌘</kbd>
            <kbd className="kbd kbd-sm bg-gray-700 text-gray-300">K</kbd>
        </div>
    </div>
);
