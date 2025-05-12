import UserMessage from "../messages/userMessage"
import { Message, User } from "../../../interfaces/interfaces"
import { useEffect, useRef } from "react"

export default function ChatBody({ messages, user }: { messages: Message[] | null, user: User }) {
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        console.log('messages changed')
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages])

    return (
        <div ref={messagesContainerRef}
            className="h-[90%] bg-[#252525] overflow-auto scroll-smooth overscroll-none">
            {messages?.length == 0 ? (
                <div className="flex font-bold text-gray-200 text-lg text-center h-full items-center justify-center">
                    No messages found
                </div>
            ) : (
                messages?.map((message, index) => {
                    return (
                        <UserMessage key={index} message={message} user={user} />
                    )
                })
            )}
        </div>
    )
}