import { useNavigate } from "react-router-dom";
import { User } from "@/types/interfaces";
import ProfilePicturePreview from "@/components/common/ProfilePicturePreview";



export default function UserComponent({ user, onlineUsers }: { user: User, onlineUsers: string[] | undefined }) {
    const date = new Date(user.lastActiveTime)
    const router = useNavigate()

    const onClick = () => {
        localStorage.setItem('selectedUser', JSON.stringify(user))
        router('/c/dm/' + user._id)
    }

    const isUserOnline = onlineUsers?.includes(user._id)

    return (
        <div className="flex btn btn-lg bg-[#252525] items-center justify-between py-8 rounded-lg"
            onClick={onClick}>
            <div className="flex gap-x-4 items-center">
                <div className={`avatar ${isUserOnline ? 'avatar-online' : 'avatar-offline'}  btn btn-lg btn-square rounded-full bg-black`}>
                    <ProfilePicturePreview
                        username={user.username}
                        textSize="3xl"
                    />
                </div>
                <div className="text-sm font-semibold text-gray-200">
                    {user.username}
                </div>
            </div>
            <div className="text-sm text-gray-400">
                {date.toDateString()}
            </div>
        </div>
    )
}