import * as iconsFa from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { NavigatorProps } from "../interfaces/interfaces"
import ProfilePicturePreview from "../utilities/ProfilePicturePreview"


export default function Navigator({ initialCurrentUser, socket, mediaType, serverUrl, loadedImage, photos }: NavigatorProps) {
    const navigate = useNavigate()
    const isMobile = mediaType.isMobile

    const handleLogout = () => {
        localStorage.clear()
        navigate("/login")
        socket.disconnect()
    }

    return (
        <div
            className={`flex ${isMobile ? "justify-between w-full" : "flex-col space-y-4 justify-evenly"} lg:space-y-10 h-full items-center`}
        >

            <div className="flex justify-center w-8 h-8 md:w-16 md:h-16 lg:w-24 lg:h-24 xl:w-36 xl:h-36  rounded-full">
                <ProfilePicturePreview
                    serverUrl={serverUrl}
                    profilePicture={initialCurrentUser?.image || ''}
                    loadedImage={loadedImage}
                    photos={photos}
                    username={initialCurrentUser?.username || 'U'}
                    textSize="text-7xl"
                />
            </div>
            <div
                className={`flex ${isMobile ? "justify-evenly" : "justify-center space-y-2 flex-col"
                    } md:space-y-4 lg:space-y-8 xl:space-y-14`}
            >
                <div onClick={() => navigate("/")} className="flex space-x-4">
                    <div className="w-8 h-8">
                        <iconsFa.FaHome size={"100%"} className="text-slate-200" />
                    </div>
                    <div className="hidden xl:block text-slate-200 font-semibold text-xl">Home</div>
                </div>
                <div onClick={() => navigate("/chat")} className="flex space-x-4">
                    <div className="w-8 h-8">
                        <iconsFa.FaRegCommentDots size={"100%"} className="text-slate-200" />
                    </div>
                    <div className="hidden xl:block text-slate-200 font-semibold text-xl">Chats</div>
                </div>
                <div onClick={() => navigate("/notification")} className="flex space-x-4">
                    <div className="w-8 h-8">
                        <iconsFa.FaBell size={"100%"} className="text-slate-200" />
                    </div>
                    <div className="hidden xl:block text-slate-200 font-semibold text-xl">Notification</div>
                </div>
                <div onClick={() => navigate("/setting")} className="flex space-x-4">
                    <div className="w-8 h-8">
                        <iconsFa.FaCog size={"100%"} className="text-slate-200" />
                    </div>
                    <div className="hidden xl:block text-slate-200 font-semibold text-xl">Setting</div>
                </div>
            </div>

            <div className={`flex   space-y-2 flex-col w-full`}>
                <button
                    onClick={() => document.getElementById('my_modal_5')?.showModal()}
                    className="flex  space-x-4 cursor-pointer"
                >
                    <div className="w-8 h-8">
                        <iconsFa.FaDoorOpen size={"100%"} className="text-slate-200" />
                    </div>
                    <div className="hidden xl:block text-slate-200 font-semibold text-xl">Logout</div>
                </button>
            </div>
            <dialog property="popover" id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <p className="text-lg text-slate-300 font-semibold mb-4">
                        Are you sure you want to logout?
                    </p>
                    <div className="modal-action">
                        <form method="dialog " className="flex gap-x-4">
                            <button
                                className="btn btn-soft"
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-soft btn-error"
                                onClick={handleLogout}
                            >
                                Logout

                            </button>
                        </form>
                    </div>
                </div>
            </dialog>

        </div>
    )
}
