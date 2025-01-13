import { Socket } from "socket.io-client";

export interface User {
    _id: string,
    username: string,
    names: string,
    email: string,
    password: string,
    image: string,
    imageData: string,
    lastActiveTime: Date,
    unreads: Message[],
    latestMessage: Message,
}


export interface Message {
    _id: string | number,
    sender: string,
    message: string,
    receiver: string,
    imageData?: string,
    isMessageSeen: boolean,
    edited: boolean,
    isMessageSent: boolean,
    isMessageReceived: boolean,
    reactions: string[],
    replying: Message | null,
    type: string,
    createdAt: Date
}


export interface Group {
    _id: string;
    groupName: string;
    image: string
    description: string;
    members: User[];
    admins: User[];
    messages: Message[];
    createdTime: Date;
    latestMessage: GroupMessage | null;
    aesKey: string,
    iv: string,
    encryptedPrivateKey: string
}


export interface GroupMessage {
    _id: string,
    sender: User,
    message: string,
    group: Group,
    seen: {
        member: User,
        seenAt: Date
    },
    edited: boolean,
    isMessageSent: boolean,
    reactions: string[],
    replying: GroupMessage,
    type: string,
    createdAt: Date
}

export interface GroupMember {
    member: User
    role: string
}


export interface DashboardProps {
    serverUrl: string;
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    },
    socket: Socket
}

export interface UserListProps {
    filteredUsers: User[];
    currentUser: User | null;
    onlineUsers: string[],
    typingUsers: string[],
    socket: Socket,
    handleSetUnreads: (newUnreads: Message[]) => void
    loading: boolean
    navigate: (path: string) => void
    serverUrl: string
}


export interface FormData {
    names: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    image?: string;
}

export interface RefMap {
    [key: string]: React.RefObject<HTMLInputElement> | null;
}

export interface InputProps {
    name: string;
    type?: string;
    label: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    ref?: React.RefObject<HTMLInputElement>;
}

export interface EmailInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isValid: boolean;
    emailError: string;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    ref: React.RefObject<HTMLInputElement>;
}

export interface ChatScreenProps {
    socket: Socket;
    users: User[];
    serverUrl: string;
    sentMessage: (message: Message) => void;
    onlineUsers: string[]
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
}

export interface SocketMessageProps {
    sentMessage: Message;
    messageId: string | number;
}


export interface CreateGroupProps {
    socket: Socket;
    mediaType: {
        isDesktop: boolean;
        isTablet: boolean;
        isMobile: boolean;
    };
    userList: User[];
    serverUrl: string
}

export interface FriendContentProps {
    initialFriends: User[];
    unreads?: Message[] | null;
    onlineUsers: string[]
    typingUsers: string[]
    socket: Socket,
    serverUrl: string
    setUnreads: (data: Message[]) => void
}

export interface MessageProps {
    user: User | null;
    serverUrl: string;
    sentMessages: Message | null;
    socketMessage: { sentMessage: Message; messageId: string | number } | null;
    socket: Socket;
    friend: User
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
}

export interface NavigatorProps {
    initialCurrentUser: User | null;
    socket: Socket;
    mediaType: {
        isDesktop: boolean;
        isTablet: boolean;
        isMobile: boolean;
    };
    serverUrl: string
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface SenderProps {
    socket: Socket,
    sentMessage: ({ message }: { message: Message }) => void
    serverUrl: string
}

export interface FileMessagePreviewProps {
    key: number
    data: File;
    cancelFile: (fileName: string) => void;
}
