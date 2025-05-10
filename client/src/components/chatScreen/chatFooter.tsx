import Picker from "@emoji-mart/react";
import data from '@emoji-mart/data';
import { FaCamera, FaLink, FaPaperPlane, FaRegFaceLaugh } from "react-icons/fa6";
import { ChangeEvent, useState } from "react";

export default function ChatFooter() {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [message, setMessage] = useState('')

    const handleMessageInputChange = (e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)
    const handleEmojiSelect = (data: { native: string }) => {
        setMessage((prev) => (prev + data.native));
    };
    return (
        <div className="flex border-2 border-gray-300 rounded-lg h-[10%] items-center justify-between px-4 gap-x-4">
            <div className="flex gap-x-2">
                <div className="btn btn-square border-0 shadow shadow-gray-500 bg-white">
                    <FaLink color="black" />
                </div>
                <div className="btn btn-square border-0 shadow shadow-gray-500 bg-white">
                    <FaCamera color="black" />
                </div>
            </div>

            <div className="w-full">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={handleMessageInputChange}
                    className="flex-1 px-4 py-2 bg-gray-300/80 text-gray-800 rounded-lg border border-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                />
            </div>

            <div className="flex gap-x-2">
                <div
                    className="btn btn-square border-0 shadow shadow-gray-500 bg-white"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <FaRegFaceLaugh color="black" />
                </div>
                <div 
                className="btn btn-square border-0 shadow shadow-gray-500 bg-white">
                    <FaPaperPlane color="black" />
                </div>

            </div>

            {showEmojiPicker && (<div className="absolute bottom-40 left-50 z-50 " >
                <Picker
                    data={data}
                    theme="light"
                    onEmojiSelect={handleEmojiSelect}
                />
            </div>)}

        </div>
    )
}