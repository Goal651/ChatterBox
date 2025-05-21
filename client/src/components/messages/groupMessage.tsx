import { GroupMessage, User } from "@/types/interfaces";

export default function GroupMessageComponent({ message, user }: { message: GroupMessage, user: User }) {
    const isUserSend = message.sender == user._id
    return (
        <div className={`p-4  chat ${isUserSend ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-bubble max-w-2xl rounded-lg bg-[#0e0e0e]">
                {message.message}
            </div>
        </div>
    )
}