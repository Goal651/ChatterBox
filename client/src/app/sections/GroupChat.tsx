import { getGroupMessagesApi } from "@/api/MessageApi"
import GroupChatBody from "@/components/chat/group/chatBody"
import GroupChatFooter from "@/components/chat/group/chatFooter"
import GroupChatHeader from "@/components/chat/group/chatHeader"
import { Group, GroupMessage, User } from "@/types/interfaces"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export default function GroupChatSection() {

    const params = useParams()
    const [groupId, setGroupId] = useState('')
    const [loadingMessages, setLoadingMessages] = useState(true)
    const [group, setGroup] = useState<Group | null>(() => {
        const storedUser = localStorage.getItem('selectedGroup')
        return storedUser ? JSON.parse(storedUser) : null
    })


    const [loggedUser, setLoggedUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('authenticatedUser')
        return storedUser ? JSON.parse(storedUser) : null
    })


    useEffect(() => {
        const { id } = params as { id: string }
        setGroupId(id)
        const storedGroup = localStorage.getItem('selectedGroup')
        setGroup(storedGroup ? JSON.parse(storedGroup) : null)
    }, [params])

    const [messages, setMessages] = useState<GroupMessage[] | null>(null)

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                 if(!loggedUser){
                    const storedUser = localStorage.getItem('authenticatedUser')
                    setLoggedUser(storedUser ? JSON.parse(storedUser) : null)
                }
                if (!groupId || groupId == '0') return
                setMessages(null)
                setLoadingMessages(true)
                const messages = await getGroupMessagesApi(groupId)
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
    }, [groupId, loggedUser])

    const addNewMessage = (message: GroupMessage) => {
        setMessages((prev) => {
            if (!prev) return null
            return [...prev, message]
        })
    }
    if (!loggedUser) return 


    return (
        <div className="flex flex-col h-screen w-[70%] relative">
            {group && groupId ? (
                <>
                    <GroupChatHeader group={group} />
                    <GroupChatBody
                        messages={messages}
                        user={loggedUser}
                        isLoading={loadingMessages}
                    />
                    <GroupChatFooter
                        addNewMessage={addNewMessage}
                        group={groupId}
                        sender={loggedUser?._id}
                    />
                </>
            ) : (
                <div className="flex font-bold text-gray-200 text-lg text-center h-full items-center justify-center">
                    <span>No Group selected</span>
                </div>
            )}
        </div>
    )
}