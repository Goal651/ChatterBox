import { FaGear } from "react-icons/fa6";
import { User } from "../../interfaces/interfaces";
import ProfilePicturePreview from "../shared/ProfilePicturePreview";

export default function SideBarSetting({ initialCurrentUser }: { initialCurrentUser: User }) {
    return (
        <div className="flex flex-col gap-y-4">
            <div className="btn btn-square bg-white border-0 text-black font-bold shadow shadow-gray-400 rounded-lg">
                <FaGear />
            </div>
            <div className="btn btn-square rounded-full bg-black shadow shadow-gray-400 ">
                <ProfilePicturePreview
                    profilePicture={initialCurrentUser?.image || ''}
                    username={initialCurrentUser?.username || 'U'}
                    textSize="text-2xl"
                    className="rounded-full border-4 border-gray-700 transition-transform duration-300 group-hover:scale-105 group-hover:border-blue-500"
                />
            </div>
        </div>
    )
}