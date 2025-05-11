interface User {
    _id: string,
    username: string,
    email: string,
    password: string,
    image: string,
    imageData: string,
    lastActiveTime: Date,
    unreads: Message[],
    latestMessage: Message,
    privateKey:string
}

interface Message {
    _id: string,
    sender: User,
    message: string,
    receiver: User,
    isMessageSeen: boolean,
    edited: boolean,
    isMessageSent: boolean,
    isMessageReceived:boolean,
    reactions: string[],
    replying: string,
    type: string,
    timestamp: Date
}

interface Group {
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

interface GroupMessage {
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
interface GroupMember {
    member: User
    role: string
}



export {
    User,
    Message,
    Group,
    GroupMessage,
    GroupMember
}