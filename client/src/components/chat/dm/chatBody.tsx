import UserMessage from "@/components/messages/userMessage"
import { Message, User } from "@/types/interfaces"
import { useEffect, useRef } from "react"

export default function DmChatBody({ messages, user, isLoading }: { messages: Message[] | null, user: User, isLoading: boolean }) {
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

    if (isLoading) return (
        <div className="h-[90%] bg-[#1b1a1a] overflow-auto scroll-smooth overscroll-none">
            <img src='/bg/chat.png' className='absolute left-0 top-0 h-full w-full object-cover  opacity-1' />

            <div className="flex font-bold text-gray-200 text-lg text-center h-full items-center justify-center">
                Loading...
            </div>
        </div>
    )

    return (
        <div ref={messagesContainerRef}
            className="h-[90%] bg-[#1b1a1a] overflow-auto scroll-smooth overscroll-none">
            <img src='/bg/chat.png' className='absolute left-0 top-0 h-full w-full object-cover bg-transparent opacity-1' />

            {messages?.length == 0 || !messages ? (
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