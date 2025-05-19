import { User } from "@/interfaces/interfaces";
import ProfilePicturePreview from "../common/ProfilePicturePreview";
import { useEffect, useState } from "react";

export default function SelectableUser({ user, selectedUsers }: { user: User, selectedUsers: Set<string> }) {
    const [selected, setSelected] = useState(false)
    useEffect(() => {
        console.log(selectedUsers.has(user._id))
        setSelected(selectedUsers.has(user._id))
    }, [selectedUsers])
    return (
        <div className={`flex gap-x-3 ${selected ? 'bg-[#0e0e0e]' : 'bg-[#101010]'} p-2 rounded-lg items-center cursor-pointer hover:bg-[#121212]`}>
            <div className="btn btn-square rounded-full ">
                <ProfilePicturePreview
                    username={user.username}
                    textSize="5xl" />
            </div>
            <div className="font-semibold text-sm">
                {user.username} ({user.email})
            </div>

        </div>
    )
}