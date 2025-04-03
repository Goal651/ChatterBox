interface User {
    _id: string;
    username: string;
    names: string;
    email: string;
    password: string;
    image: string;
    imageData: string;
    lastActiveTime: Date;
    unreads: Message[];
    latestMessage: Message | null; // Allow null for no message
    privateKey?: string; // Optional, only if frontend decrypts
}

interface Message {
    _id: string;
    sender: User;
    message: string; // Plaintext (server-decrypted)
    receiver: User;
    isMessageSeen: boolean;
    edited: boolean;
    isMessageSent: boolean;
    isMessageReceived: boolean;
    reactions: { reaction: string; reactor: User }[]; // Match backend
    replying: string | null; // ID or null
    type: string;
    timestamp: Date; // Rename to createdAt if preferred
}

interface Group {
    _id: string;
    groupName: string;
    image: string;
    description: string;
    members: GroupMember[]; // Use GroupMember to match backend
    admins: User[];
    messages: GroupMessage[]; // Not populated in API, adjust if needed
    createdTime: Date;
    latestMessage: GroupMessage | null;
    aesKey?: string; // Optional, only if frontend decrypts
    iv?: string;
    encryptedPrivateKey?: string;
}

interface GroupMessage {
    _id: string;
    sender: User;
    message: string; // Plaintext (server-decrypted)
    group: Group;
    seen: { member: User; seenAt: Date }[]; // Array to match backend
    edited: boolean;
    isMessageSent: boolean;
    reactions: { reaction: string; reactor: User }[]; // Match backend
    replying: GroupMessage | null; // Allow null
    type: string;
    createdAt: Date;
}

interface GroupMember {
    member: User;
    role: string;
}

export {
    User,
    Message,
    Group,
    GroupMessage,
    GroupMember
};