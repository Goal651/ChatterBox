import { Socket } from "socket.io-client"

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
    _id: string
    groupName: string
    image: string
    description: string
    members: [{
        member: User,
        role: string
    }]
    messages: Message[]
    createdTime: Date
    latestMessage: GroupMessage | null
}

export interface UserGroupListProps {
    filteredUsers: User[]
    groups: Group[]
    currentUser: User | null
    onlineUsers: string[]
    typingUsers: string[]
    socket: Socket
    handleSetUnreads: (newUnreads: Message[]) => void
    loading: boolean
    navigate: (path: string) => void
    imageLoaded: (data: Photos) => void
    photos: Photos[]
}

export interface GroupMessage {
    _id: string | number,
    sender: User,
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

export interface UserGroupListProps {
    filteredUsers: User[]
    groups: Group[]
    currentUser: User | null
    onlineUsers: string[],
    typingUsers: string[],
    socket: Socket,
    handleSetUnreads: (newUnreads: Message[]) => void
    loading: boolean
    navigate: (path: string) => void
    imageLoaded: (data: Photos) => void
    photos: Photos[]
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

export interface EmailInputProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    isValid: boolean
    emailError: string
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void
    ref: React.RefObject<HTMLInputElement>
}

export interface ChatScreenProps {
    groups: Group[]
    socket: Socket
    users: User[]
    sentMessage: (message: Message) => void
    sentGroupMessage: (message: GroupMessage) => void
    onlineUsers: string[]
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
    loadedImage: (data: Photos) => void
    photos: Photos[]
}

export interface SocketMessageProps {
    sentMessage: Message
    messageId: string | number
}

export interface GroupUser {
    _id: string,
    username?: string,
    names?: string,
    email?: string,
    image: string,
    lastActiveTime?: Date,
    groupName?: string
    description?: string
    members?: User[]
    admins?: User[]
    createdTime?: Date
    latestMessage?: GroupMessage | Message | null
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
    images: (data: Photos) => void
    photos: Photos[]
    loading: boolean
}

export interface GroupContentProps {
    loading: boolean
    groups: Group[]
    socket: Socket,
    images: (data: Photos) => void
    photos: Photos[]
}

export interface MessageProps {
    component: GroupUser
    sentMessages: Message | null
    sentGroupMessage: GroupMessage | null
    socketMessage: { sentMessage: Message, messageId: string | number } | null
    socket: Socket
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
    photos: Photos[]
    images: (data: Photos) => void
    onEditMessage: (message: Message) => void
}


export interface GroupMessagesProps {
    messages: GroupMessage[],
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
    photos: Photos[]
    images: (data: Photos) => void
}


export interface NavigatorProps {
    initialCurrentUser: User | null
    socket: Socket
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
    loadedImage: (data: Photos) => void
    photos: Photos[]
}

export interface Notification {
    id: string
    title: string
    message: string
    timestamp: string
    read: boolean
}

export interface SenderProps {
    socket: Socket,
    messageInEdition: Message | null
    sentMessage: ({ message }: { message: Message }) => void
    sentGroupMessage: ({ message }: { message: GroupMessage }) => void
}

export interface FileMessagePreviewProps {
    key: number
    data: File
    cancelFile: (fileName: string) => void
}

export interface Photos {
    photo: string
    key: string
}