import { User } from "@/types/interfaces";
import ProfilePicturePreview from "../common/ProfilePicturePreview";


export default function GroupMember({ member }: { member:{role: string, member: User} }) {
    return (
        <div className="flex justify-between bg-[#050505] p-4 rounded-lg shadow-lg text-gray-200 items-center px-10">
            <div className="flex gap-x-4 items-center">
                <div className="btn btn-square rounded-full text-white bg-black">
                    <ProfilePicturePreview
                        username={member.member.username}
                        textSize="2xl" />
                </div>
                <div>
                    {member.member.username}
                </div>
            </div>
            <div>
                {member.role}
            </div>
        </div>
    )
}