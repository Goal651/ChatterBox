import * as iconsFa from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { NavigatorProps } from "../interfaces/interfaces";
import ProfilePicturePreview from "../utilities/ProfilePicturePreview";

export default function Navigator({ initialCurrentUser, socket, mediaType, serverUrl, loadedImage, photos }: NavigatorProps) {
    const navigate = useNavigate();
    const isMobile = mediaType.isMobile;

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
        socket.disconnect();
    };

    return (
        <div className={`flex ${isMobile ? "justify-between w-full" : "flex-col space-y-6 justify-between"} lg:space-y-10 h-full items-center py-4`}>
            {/* Profile Picture */}
            <div className="flex justify-center w-12 h-12 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-40 xl:h-40 rounded-full group relative">
                <ProfilePicturePreview
                    serverUrl={serverUrl}
                    profilePicture={initialCurrentUser?.image || ''}
                    loadedImage={loadedImage}
                    photos={photos}
                    username={initialCurrentUser?.username || 'U'}
                    textSize="text-7xl"
                    className="rounded-full border-4 border-gray-700 transition-transform duration-300 group-hover:scale-105 group-hover:border-blue-500"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Navigation Icons */}
            <div className={`flex ${isMobile ? "justify-evenly w-full" : "flex-col space-y-4 justify-center"} md:space-y-6 lg:space-y-10 xl:space-y-14`}>
                <div onClick={() => navigate("/")} className="flex items-center space-x-4 cursor-pointer group transition-all duration-200 hover:bg-gray-800/50 p-2 rounded-lg">
                    <div className="w-8 h-8 flex-shrink-0">
                        <iconsFa.FaHome size="100%" className="text-gray-300 group-hover:text-blue-400 transition-colors duration-200" />
                    </div>
                    <span className="hidden xl:block text-gray-300 font-semibold text-xl group-hover:text-blue-400 transition-colors duration-200">Home</span>
                </div>
                <div onClick={() => navigate("/chat")} className="flex items-center space-x-4 cursor-pointer group transition-all duration-200 hover:bg-gray-800/50 p-2 rounded-lg">
                    <div className="w-8 h-8 flex-shrink-0">
                        <iconsFa.FaRegCommentDots size="100%" className="text-gray-300 group-hover:text-blue-400 transition-colors duration-200" />
                    </div>
                    <span className="hidden xl:block text-gray-300 font-semibold text-xl group-hover:text-blue-400 transition-colors duration-200">Chats</span>
                </div>
                <div onClick={() => navigate("/notification")} className="flex items-center space-x-4 cursor-pointer group transition-all duration-200 hover:bg-gray-800/50 p-2 rounded-lg">
                    <div className="w-8 h-8 flex-shrink-0">
                        <iconsFa.FaBell size="100%" className="text-gray-300 group-hover:text-blue-400 transition-colors duration-200" />
                    </div>
                    <span className="hidden xl:block text-gray-300 font-semibold text-xl group-hover:text-blue-400 transition-colors duration-200">Notifications</span>
                </div>
                <div onClick={() => navigate("/setting")} className="flex items-center space-x-4 cursor-pointer group transition-all duration-200 hover:bg-gray-800/50 p-2 rounded-lg">
                    <div className="w-8 h-8 flex-shrink-0">
                        <iconsFa.FaCog size="100%" className="text-gray-300 group-hover:text-blue-400 transition-colors duration-200" />
                    </div>
                    <span className="hidden xl:block text-gray-300 font-semibold text-xl group-hover:text-blue-400 transition-colors duration-200">Settings</span>
                </div>
            </div>

            {/* Logout */}
            <div className="flex w-full">
                <button
                    onClick={() => {
                        const modal = document.getElementById('my_modal_5') as HTMLDialogElement;
                        modal?.showModal();
                    }}
                    className="flex items-center space-x-4 cursor-pointer group transition-all duration-200 hover:bg-gray-800/50 p-2 rounded-lg w-full"
                >
                    <div className="w-8 h-8 flex-shrink-0">
                        <iconsFa.FaDoorOpen size="100%" className="text-gray-300 group-hover:text-red-400 transition-colors duration-200" />
                    </div>
                    <span className="hidden xl:block text-gray-300 font-semibold text-xl group-hover:text-red-400 transition-colors duration-200">Logout</span>
                </button>
            </div>

            {/* Logout Modal */}
            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-gray-900/95 rounded-xl shadow-xl p-6">
                    <p className="text-lg text-gray-200 font-semibold mb-6">Are you sure you want to logout?</p>
                    <div className="modal-action flex gap-4">
                        <form method="dialog">
                            <button className="btn px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md">Cancel</button>
                        </form>
                        <button
                            className="btn px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}