import Picker from "@emoji-mart/react";
import data from '@emoji-mart/data';
import { FaCamera, FaLink, FaPaperPlane, FaRegFaceLaugh } from "react-icons/fa6";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { GroupMessage, Message } from "@/types/interfaces";
import { notify } from "@/utils/NotificationService";
import { useSocket } from "@/context/SocketContext";

interface GroupChatFooterParams {
    addNewMessage: (message: GroupMessage) => void,
    sender: string | undefined,
    group: string | null

}

export default function GroupChatFooter({
    addNewMessage,
    group,
    sender
}: GroupChatFooterParams) {
    const { socket } = useSocket()
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [message, setMessage] = useState('')

    const handleMessageInputChange = (e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)
    const handleEmojiSelect = (data: { native: string }) => setMessage((prev) => (prev + data.native))

    const socketSendMessage = (data: GroupMessage) => {
        if (socket) {
            socket.emit('groupMessage', data)
        }
    }

    const handleOnSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!sender || !group) return notify('Error Occured! Try reloading', 'error')
        setMessage('')
        setShowEmojiPicker(false)
        const newMessage: GroupMessage = {
            _id: new Date().getMilliseconds(),
            sender,
            group,
            seen: [],
            message,
            edited: false,
            isMessageSent: false,
            reactions: [],
            replying: null,
            createdAt: new Date(),
            type: 'text'
        }
        addNewMessage(newMessage)
        socketSendMessage(newMessage)
    }

    useEffect(() => {
        if (socket) {
            socket.on('receiveGroupMessage', (data: GroupMessage) => {
                addNewMessage(data)
            })
            return () => {
                socket.off('receiveGroupMessage')
            }
        }
    }, [])

    return (
        <form className="flex  rounded-lg h-[10%] items-center justify-between px-4 gap-x-4 bg-[#0f0f0f] z-5"
            onSubmit={handleOnSendMessage}>
            <div className="flex gap-x-2">
                <div className="btn btn-square border-0 shadow  bg-[#252525]">
                    <FaLink color="white" />
                </div>
                <div className="btn btn-square border-0 shadow  bg-[#252525]">
                    <FaCamera color="white" />
                </div>
            </div>

            <div className="w-full">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={handleMessageInputChange}
                    className="flex-1 px-4 py-2 bg-[#252525] text-gray-300 rounded-lg border border-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                />
            </div>

            <div className="flex gap-x-2">
                <div
                    className="btn btn-square border-0 shadow bg-[#252525]"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <FaRegFaceLaugh color="white" />
                </div>
                <button
                    className="btn btn-square border-0 shadow bg-[#252525]"
                    type="submit">
                    <FaPaperPlane color="white" />
                </button>

            </div>

            {showEmojiPicker && (<div className="absolute bottom-40 left-50 z-50 " >
                <Picker
                    data={data}
                    theme="dark"
                    onEmojiSelect={handleEmojiSelect}
                />
            </div>)}

        </form>
    )
}