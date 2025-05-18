import { useEffect, useState } from "react"
import ChatBody from "@/components/shared/chatScreen/chatBody"
import ChatFooter from "@/components/shared/chatScreen/chatFooter"
import ChatHeader from "@/components/shared/chatScreen/chatHeader"
import { Message, User } from "@/interfaces/interfaces"
import { getMessagesApi } from "@/api/MessageApi"
import { useParams } from "react-router-dom"

export default function ChatSection() {
    const params = useParams()
    const [userId, setUserId] = useState('')
    const [loadingMessages, setLoadingMessages] = useState(true)
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('selectedUser')
        return storedUser ? JSON.parse(storedUser) : null
    })

    const [loggedUser, setLoggedUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('authenticatedUser')
        return storedUser ? JSON.parse(storedUser) : null
    })


    useEffect(() => {
        const { userId } = params as { userId: string }
        setUserId(userId)
        const storedUser = localStorage.getItem('selectedUser')
        setUser(storedUser ? JSON.parse(storedUser) : null)
    }, [params])

    const [messages, setMessages] = useState<Message[] | null>(null)

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (!userId) return
                setMessages(null)
                setLoadingMessages(true)
                const messages = await getMessagesApi(userId)
                if (!messages) {
                    setMessages(null)
                    setLoadingMessages(false)
                    return
                }
                setMessages(messages.messages)
                setLoadingMessages(false)
            } catch (e) {
                console.error(e)
                setLoadingMessages(false)
                setMessages(null)
            }
        }
        fetchMessages()
    }, [userId])

    const addNewMessage = (message: Message) => {
        setMessages((prev) => {
            if (!prev) return null
            return [...prev, message]
        })
    }

    return (
        <div className="flex flex-col h-screen w-6xl relative">
            {user && userId ? (
                <>
                    <ChatHeader user={user} />
                    <ChatBody
                        messages={messages}
                        user={user}
                        isLoading={loadingMessages}
                    />
                    <ChatFooter
                        addNewMessage={addNewMessage}
                        receiver={userId}
                        sender={loggedUser?._id}
                    />
                </>
            ) : (
                <div className="flex font-bold text-gray-200 text-lg text-center h-full items-center justify-center">
                    <span>No user selected</span>
                </div>
            )}
        </div>
    )
}