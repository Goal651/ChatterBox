export interface User {
    _id: string,
    username: string,
    names: string,
    email: string,
    password: string,
    image: string,
    imageData: string,
    lastActiveTime: Date,
    unreads: Message[] | [] ,
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


