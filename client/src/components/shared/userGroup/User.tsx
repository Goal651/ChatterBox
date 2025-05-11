import ProfilePicturePreview from "../../common/ProfilePicturePreview";


export default function UserComponent() {

    return (
        <div className="flex btn btn-lg bg-[#252525] items-center justify-between py-8">
            <div className="flex gap-x-4 items-center">
                <div className="btn btn-lg btn-square rounded-full bg-black">
                    <ProfilePicturePreview
                        username="wigo"
                        textSize="3xl"
                    />
                </div>
                <div className="text-sm font-semibold text-gray-200">
                    Wigothehacker
                </div>
            </div>
            <div className="text-sm text-gray-400">Active an hour ago</div>
        </div>
    )
}