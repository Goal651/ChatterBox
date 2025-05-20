import { Group } from "@/types/interfaces";
import ProfilePicturePreview from "@/components/common/ProfilePicturePreview";
import { useNavigate } from "react-router-dom";

export default function GroupComponent({ group }: { group: Group }) {
    const route = useNavigate()

    const handleNavigate = () => {
        localStorage.setItem('selectedGroup', JSON.stringify(group))
        route('/c/grp/' + group._id)
    }
    return (
        <div className="flex btn btn-lg bg-[#252525] items-center justify-between py-8"
            onClick={handleNavigate}>
            <div className="flex gap-x-4 items-center">
                <div className="btn btn-lg btn-square rounded-full bg-black">
                    <ProfilePicturePreview
                        username={group.groupName}
                        textSize="3xl"
                    />
                </div>
                <div className="text-sm font-semibold text-gray-200">
                    {group.groupName}
                </div>
            </div>
            <div className="text-sm text-gray-400">
                3 active members
            </div>
        </div>
    )
}