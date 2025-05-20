export interface GroupMessageData {
    group: string;
    message: string;
    type: string;
    messageId: string;
    sender: string;
}

export interface MessageSeenData {
    messageId: string;
    receiverId: string;
}

export interface DeleteMessageData {
    messageId: string;
    receiverId: string;
}

export interface EditMessageData {
    messageId: string;
    message: string;
    receiverId: string;
}

export interface ReactToMessageData {
    messageId: string;
    receiverId: string;
    reaction: string;
}