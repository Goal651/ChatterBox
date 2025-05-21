import ProfilePicturePreview from "../common/ProfilePicturePreview";

export default function NotificationComponent() {
    return (
        <div className="flex w-full bg-[#202020] p-4 items-center justify-between rounded-lg">
            <div className="flex gap-x-4">
                <div className="btn btn-lg btn-square rounded-full bg-[#1a1a1a] text-blue-400">
                    <ProfilePicturePreview
                        username="John Doe"
                        textSize="2xl" />
                </div>
                <div className="flex flex-col gap-y-2">
                    <div className="font-semibold">You have been added to the group "New Group"</div>
                    <div className="text-sm text-gray-400">2 hours ago</div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-y-2 justify-between"> 
                <div className="w-4 h-4 rounded-full bg-blue-600 "/>
                    <div className="text-sm text-gray-400">2 hrs ago</div>
            </div>

        </div>
    )
}