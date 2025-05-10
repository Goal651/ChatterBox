import { useEffect, useState } from "react"
import ProfilePicturePreview from "./ProfilePicturePreview"
import { UserGroupListProps, User, Group, GroupMessage } from "../../interfaces/interfaces"
import MainStorage from "../../data/Storage"

export default function UserGroupList({ users, groups }: UserGroupListProps) {
    const [friends, setFriends] = useState(users)
    const currentUser = MainStorage().loggedInUserInfo

    useEffect(() => {
        setFriends(users)
    }, [users])



    const renderStatus = (item: User | Group, isGroup: boolean) => {
        if (isGroup) return null

        const friend = item as User
        if (friend?.latestMessage?.receiver === friend._id) {
            return friend.latestMessage.isMessageSent ? (
                <div className="flex flex-col items-end text-2xl leading-none">
                    <span className={`${friend.latestMessage.isMessageSeen ? 'text-blue-400' : 'text-gray-400'}`}>✓</span>
                    {friend.latestMessage.isMessageReceived && <span className={`${friend.latestMessage.isMessageSeen ? 'text-blue-400' : 'text-gray-400'} -mt-2`}>✓</span>}
                </div>
            ) : (
                <span className="text-red-400 text-xl">✗</span>
            )
        }
    }

    const combinedList = [
        ...friends.map(f => ({ ...f, isGroup: false })),
        ...groups.map(g => ({ ...g, isGroup: true })),
    ].sort((a, b) => {
        const aTime = a.latestMessage ? new Date(a.latestMessage.createdAt).getTime() : 0
        const bTime = b.latestMessage ? new Date(b.latestMessage.createdAt).getTime() : 0
        return bTime - aTime // Sort by latest message time, descending
    })



    if (combinedList.length === 0) return (
        <div className="h-full flex flex-col items-center justify-center rounded-2xl shadow-inner">
            <span className="text-gray-800 text-lg font-medium">No friends or groups available</span>
        </div>
    )

    return (
        <div className=" p-4 flex flex-col space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-2xl shadow-inner">
            {combinedList.map((item) => {
                const isGroup = item.isGroup
                const id = item._id
                const name = isGroup ? (item as Group).groupName : (item as User).username

                return (
                    <div
                        key={id}
                        className="w-full py-3 px-2 rounded-lg hover:bg-gray-900/80 transition-all duration-200 cursor-pointer"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="w-12 h-12">
                                        <ProfilePicturePreview
                                            profilePicture={item.image}
                                            username={name}
                                            textSize="text-2xl"
                                            className="shadow-md"
                                        />
                                    </div>
                                </div>
                                <div className="max-w-xs">
                                    <div className="text-gray-200 font-semibold text-lg truncate">{name}</div>
                                    {isGroup ? (
                                        <div className="text-gray-400 text-sm truncate">
                                            {item.latestMessage ? (
                                                <span className="flex gap-x-1">
                                                    <span className="font-semibold text-blue-400">
                                                        {(item.latestMessage as GroupMessage).sender._id === currentUser?._id ? 'You' : (item.latestMessage as GroupMessage).sender.username}
                                                    </span>
                                                    <span>
                                                        {item.latestMessage.type === 'file' ? 'sent a file' : item.latestMessage.message}
                                                    </span>
                                                </span>
                                            ) : 'Say hey to your new group'}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-sm truncate">
                                            {item.latestMessage ? (
                                                item.latestMessage.sender === id ? (
                                                    item.latestMessage.type === 'file' ? 'Sent a file' : item.latestMessage.message
                                                ) : (
                                                    item.latestMessage.type === 'file' ? 'You: Sent a file' : `You: ${item.latestMessage.message}`
                                                )
                                            ) : 'Say hey to your new friend'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                                <div className="text-gray-400 text-xs">
                                    {item.latestMessage ? new Date(item.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                                {renderStatus(item, isGroup)}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}