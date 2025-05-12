import { useEffect, useState} from "react";
import ChatBody from "../../components/shared/chatScreen/chatBody";
import ChatFooter from "../../components/shared/chatScreen/chatFooter";
import ChatHeader from "../../components/shared/chatScreen/chatHeader";
import { Message, User } from "../../interfaces/interfaces";
import { getMessagesApi } from "../../api/MessageApi";

export default function ChatSection() {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('selectedUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [messages, setMessages] = useState<Message[] | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user) return;
            const messages = await getMessagesApi(user._id);
            if (!messages) return;
            setMessages(messages.messages);
        };
        fetchMessages();
    }, [user?._id])

    return (
        <div className="flex flex-col h-screen w-6xl relative">
            {user ? (
                <>
                    <ChatHeader user={user} />
                    <ChatBody messages={messages} user={user} />
                    <ChatFooter />
                </>
            ) : (
                <div className="flex font-bold text-gray-200 text-lg text-center h-full items-center justify-center">
                    <span>No user selected</span>
                </div>
            )}
        </div>
    );
}