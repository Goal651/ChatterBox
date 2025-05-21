import { Message, User } from "@/types/interfaces";

export default function UserMessage({ message, user }: { message: Message, user: User }) {
    const isUserSend = message.sender === user._id
    return (
        <div className={` p-4  chat ${isUserSend ? 'chat-start' : 'chat-end'}  `}>
            <div className="chat-bubble max-w-2xl rounded-lg bg-[#0e0e0e]">
                {message.message}
            </div>
        </div>
    )
}