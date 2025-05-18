import { Message, User } from "@/interfaces/interfaces";

export default function UserMessage({ message, user }: { message: Message, user: User }) {
    const isUserSend = message.sender === user._id
    return (
        <div className={`bg-[#252525] p-4  chat ${isUserSend ? 'chat-start' : 'chat-end'}`}>
            <div className="chat-bubble max-w-2xl rounded-lg">
                {message.message}
            </div>
        </div>
    )
}