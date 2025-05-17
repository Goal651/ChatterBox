import { useEffect, useState } from "react";
import ChatBody from "../../components/shared/chatScreen/chatBody";
import ChatFooter from "../../components/shared/chatScreen/chatFooter";
import ChatHeader from "../../components/shared/chatScreen/chatHeader";
import { Message, User } from "../../interfaces/interfaces";
import { getMessagesApi } from "../../api/MessageApi";
import { useParams } from "react-router-dom";

export default function ChatSection() {
    const params = useParams()
    const [userId, setUserId] = useState('')
    const [loadingMessages, setLoadingMessages] = useState(true)
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('selectedUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });


    useEffect(() => {
        const { userId } = params as { userId: string }
        setUserId(userId)
        const storedUser = localStorage.getItem('selectedUser');
        setUser(storedUser ? JSON.parse(storedUser) : null)
    }, [params]);

    const [messages, setMessages] = useState<Message[] | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            setMessages(null)
            setLoadingMessages(true)
            if (!userId) return;
            const messages = await getMessagesApi(userId);
            if (!messages) return;
            setMessages(messages.messages);
            setLoadingMessages(false)
        };
        fetchMessages();
    }, [userId])

    return (
        <div className="flex flex-col h-screen w-6xl relative">
            {user ? (
                <>
                    <ChatHeader user={user} />
                    <ChatBody messages={messages} user={user} isLoading={loadingMessages} />
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