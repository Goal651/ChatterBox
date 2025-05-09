import ProfilePicturePreview from "../shared/ProfilePicturePreview";

export default function SideBarProfile() {
    return (
        <div className="flex justify-center w-12 h-12 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-40 xl:h-40 rounded-full group relative">
            <ProfilePicturePreview
                profilePicture={initialCurrentUser?.image || ''}
                loadedImage={loadedImage}
                photos={photos}
                username={initialCurrentUser?.username || 'U'}
                textSize="text-7xl"
                className="rounded-full border-4 border-gray-700 transition-transform duration-300 group-hover:scale-105 group-hover:border-blue-500"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
    )
}