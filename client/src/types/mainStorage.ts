import { Message, User } from "./interfaces";

export interface ILoadedMessage {
    user: User
    messages: Message[]
}