import { User } from "@/types/interfaces";
import ProfilePicturePreview from "../common/ProfilePicturePreview";
import { useEffect, useState } from "react";

export default function SelectableUser({ user, selectedUsers }: { user: User, selectedUsers: string[] }) {
    const [selected, setSelected] = useState(false)
    useEffect(() => {
       setSelected(selectedUsers.includes(user._id))
    }, [selectedUsers, user._id])

    return (
        <div className={`flex gap-x-3 ${selected ? 'bg-[#0b3075] hover:bg-[#024392]' : 'bg-[#101010] hover:bg-[#030303]'} p-2 rounded-lg items-center cursor-pointer  transition-all `}>
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