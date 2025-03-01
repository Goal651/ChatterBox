import { useNavigate } from "react-router-dom"
import { GroupContentProps, User } from "../interfaces/interfaces"
import ProfilePicturePreview from "../utilities/ProfilePicturePreview"

export default function GroupContent({ groups, socket, images, serverUrl, photos, loading }: GroupContentProps) {
    const navigate = useNavigate()
    const currentUserData = sessionStorage.getItem('currentUser')
    const currentUser: User = JSON.parse(currentUserData || '{}')
    const handleOnClick = (data: string) => {
        if (socket) socket.emit('connectGroup', { groupId: data })
        navigate('/group/' + data)
    }

    if (loading) return (
        <div className="h-full flex justify-center pt-20">
            <div className=" text-center font-bold text-gray-500 text-xl">
                <span className="loading loading-ring loading-lg" />
            </div>
        </div>
    )

    if (groups.length <= 0) return (
        <div className="h-full flex justify-center pt-20">
            <div className=" text-center font-bold text-gray-500 text-xl">
                No groups available
            </div>
        </div>

    )
    return (
        groups.map(group => (
            <div
                key={group._id}
                onClick={() => handleOnClick(group._id)}
                className="bg-transparent  p-4 flex flex-col space-y-4 overflow-y-auto">
                <div className="w-full ">
                    <div className="flex justify-between">
                        <div className="flex space-x-4">
                            <div className="w-14 h-14">
                                <ProfilePicturePreview
                                    profilePicture={group.image}
                                    serverUrl={serverUrl}
                                    loadedImage={images}
                                    photos={photos}
                                    username={group.groupName}
                                />

                            </div>
                            <div>
                                <div className="text-white font-semibold text-lg">{group.groupName}</div>
                                <div className="text-gray-400">
                                    {group.latestMessage ? (<span className="flex gap-x-2">
                                        <span className="font-semibold text-blue-700">
                                            {group.latestMessage.sender._id === currentUser._id ? 'you' : group.latestMessage.sender.username}
                                        </span>
                                        <span>
                                            {group.latestMessage.message}
                                        </span>
                                    </span>)
                                        : 'Say hey to your new group'}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>{group.latestMessage ? new Date(group.latestMessage.createdAt).toLocaleTimeString() : ''}</div>
                        </div>
                    </div>
                </div>
            </div>
        ))
    )
}