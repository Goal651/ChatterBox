import { useNavigate } from "react-router-dom"
import { GroupContentProps } from "../interfaces/interfaces"
import ProfilePicturePreview from "../utilities/ProfilePicturePreview"




export default function GroupContent({ groups, socket, images, serverUrl, photos }: GroupContentProps) {
    const navigate = useNavigate()
    const handleOnClick = (data: string) => {
        if (socket) socket.emit('connectGroup', { groupId: data })
        navigate('/group/' + data)
    }

    if (groups.length <= 0) return null
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
                                    photos={photos} />

                            </div>
                            <div>
                                <div className="text-white font-semibold text-lg">{group.groupName}</div>
                                <div className="text-gray-400">
                                    {group.latestMessage ? '' : 'Say hey to your new group'}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>{group.latestMessage ? group.latestMessage.createdAt.toISOString() : ''}</div>
                        </div>
                    </div>
                </div>
            </div>
        ))
    )
}