import { User } from "../../../interfaces/interfaces";
import ProfilePicturePreview from "../../common/ProfilePicturePreview";


export default function UserComponent({ user }: { user: User }) {
    const date = new Date(user.lastActiveTime)

    const onClick = () => {
        localStorage.setItem('selectedUser', JSON.stringify(user))
        
    }

    return (
        <div className="flex btn btn-lg bg-[#252525] items-center justify-between py-8 rounded-lg"
            onClick={onClick}>
            <div className="flex gap-x-4 items-center">
                <div className="btn btn-lg btn-square rounded-full bg-black">
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