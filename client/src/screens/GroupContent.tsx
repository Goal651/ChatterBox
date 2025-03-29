import { useNavigate } from "react-router-dom";
import { GroupContentProps, User } from "../interfaces/interfaces";
import ProfilePicturePreview from "../utilities/ProfilePicturePreview";

export default function GroupContent({ groups, socket, images, serverUrl, photos, loading }: GroupContentProps) {
    const navigate = useNavigate();
    const currentUserData = sessionStorage.getItem('currentUser');
    const currentUser: User = JSON.parse(currentUserData || '{}');

    const handleOnClick = (data: string) => {
        if (socket) socket.emit('connectGroup', { groupId: data });
        navigate('/group/' + data);
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-950/95 rounded-2xl shadow-inner">
            <svg className="animate-spin h-12 w-12 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
            </svg>
            <span className="mt-4 text-gray-300 text-lg font-medium">Loading groups...</span>
        </div>
    );

    if (groups.length <= 0) return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-950/95 rounded-2xl shadow-inner">
            <span className="text-gray-300 text-lg font-medium">No groups available</span>
        </div>
    );

    return (
        <div className="bg-gray-950/95 p-4 flex flex-col space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-2xl shadow-inner">
            {groups.map(group => (
                <div
                    key={group._id}
                    onClick={() => handleOnClick(group._id)}
                    className="w-full py-3 px-2 rounded-lg hover:bg-gray-900/80 transition-all duration-200 cursor-pointer"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12">
                                <ProfilePicturePreview
                                    profilePicture={group.image}
                                    serverUrl={serverUrl}
                                    loadedImage={images}
                                    photos={photos}
                                    username={group.groupName}
                                    textSize="text-2xl"
                                    className="shadow-md"
                                />
                            </div>
                            <div className="max-w-xs">
                                <div className="text-gray-200 font-semibold text-lg truncate">{group.groupName}</div>
                                <div className="text-gray-400 text-sm truncate">
                                    {group.latestMessage ? (
                                        <span className="flex gap-x-1">
                                            <span className="font-semibold text-blue-400">
                                                {group.latestMessage.sender._id === currentUser._id ? 'You' : group.latestMessage.sender.username}
                                            </span>
                                            <span>
                                                {group.latestMessage.type === 'file' ? 'sent a file' : group.latestMessage.message}
                                            </span>
                                        </span>
                                    ) : 'Say hey to your new group'}
                                </div>
                            </div>
                        </div>
                        <div className="text-gray-400 text-xs">
                            {group.latestMessage ? new Date(group.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}