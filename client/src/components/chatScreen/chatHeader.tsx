import { FaPhone, FaVideo } from "react-icons/fa6";
import ProfilePicturePreview from "../shared/ProfilePicturePreview";

export default function ChatHeader() {

    return (
        <div className="flex justify-between text-black w-full items-center">
            {/* Profile section */}

            <div className="flex gap-x-4 items-center">
                <div className="btn-lg btn-square rounded-full bg-black flex items-center justify-center font-bold">
                    <ProfilePicturePreview
                        username="test"
                        textSize="5xl"
                    />
                </div>
                <div>
                    Username
                </div>
            </div>
            <div>
                Active one hour ago
            </div>

            {/* calling components */}
            <div className="flex gap-x-4">
                <div className="btn btn-square border-0 shadow shadow-gray-500 bg-white">
                    <FaPhone color="black" />
                </div>
                <div className="btn btn-square  border-0 shadow shadow-gray-500 bg-white">
                    <FaVideo
                        color="black"
                    />
                </div>
            </div>

        </div>
    )
}