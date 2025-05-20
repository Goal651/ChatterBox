import { FaPhone, FaVideo } from "react-icons/fa6";
import ProfilePicturePreview from "@/components/common/ProfilePicturePreview";
import { Group} from "@/types/interfaces";

export default function GroupChatHeader({ group }: { group: Group }) {

    return (
        <div className="flex justify-between text-gray-300 w-full items-center p-2">
            {/* Profile section */}

            <div className="flex gap-x-4 items-center">
                <div className="btn-lg btn-square rounded-full bg-black flex items-center justify-center font-bold">
                    <ProfilePicturePreview
                        username={group.groupName}
                        textSize="5xl"
                    />
                </div>
                <div>
                    {group.groupName}
                </div>
            </div>
            <div>
                {new Date().toDateString()}
            </div>

            {/* calling components */}
            <div className="flex gap-x-4">
                <div className="btn btn-square border-0 shadow  bg-[#252525] ">
                    <FaPhone color="white" />
                </div>
                <div className="btn btn-square  border-0 shadow  bg-[#252525] ">
                    <FaVideo
                        color="white"
                    />
                </div>
            </div>

        </div>
    )
}