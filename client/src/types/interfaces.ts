import { Socket } from "socket.io-client"

export interface User {
    _id: string,
    username: string,
    names: string,
    email: string,
    image: string,
    lastActiveTime: Date,
    unreads: Message[],
    latestMessage: Message,
}


export interface Message {
    _id: string | number,
    sender: string,
    message: string,
    receiver: string,
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
    _id: string
    groupName: string
    image: string
    description: string
    members: [{
        member: User,
        role: 'user'|'admin',
    }]
    messages: Message[]
    createdTime: Date
    latestMessage: GroupMessage | null
}

export interface UserGroupListProps {
    users: User[]
    groups: Group[]
    loading: boolean,
    onlineUsers: string[]
}

export interface GroupMessage {
    _id: string | number,
    sender: string,
    message: string,
    group: string,
    seen: [{
        member: User,
        seenAt: Date
    }] | [],
    edited: boolean,
    isMessageSent: boolean,
    reactions: string[],
    replying?: GroupMessage | null,
    type: string,
    createdAt: Date
}

export interface GroupMember {
    member: User
    role: string
}


export interface DashboardProps {
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    },
    socket: Socket
}




export interface FormDataSignUp {
    names: string
    username: string
    email: string
    password: string
    confirmPassword: string
    image?: string
}

export interface RefMap {
    [key: string]: React.RefObject<HTMLInputElement> | null
}

export interface InputProps {
    name: string
    type?: string
    label: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
    ref?: React.RefObject<HTMLInputElement>
}


export interface SocketMessageProps {
    sentMessage: Message
    messageId: string | number
}



export interface CreateGroupProps {
    socket: Socket
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
    userList: User[]
}

export interface FriendContentProps {
    initialFriends: User[]
    unreads?: Message[] | null
    onlineUsers: string[]
    typingUsers: string[]
    socket: Socket,
    setUnreads: (data: Message[]) => void
    loading: boolean
}

export interface GroupContentProps {
    loading: boolean
    groups: Group[]
    socket: Socket,
}


export interface GroupMessagesProps {
    messages: GroupMessage[],
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
}


export interface Notification {
    id: string
    title: string
    redirectUrl: string
    isRead: boolean
    timestamp: Date
}
