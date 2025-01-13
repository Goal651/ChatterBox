import * as iconsFa from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { NavigatorProps } from "../interfaces/interfaces";
import ProfilePicturePreview from "../utilities/ProfilePicturePreview";


export default function Navigator({ initialCurrentUser, socket, mediaType, serverUrl }: NavigatorProps) {
    const navigate = useNavigate();
    const isMobile = mediaType.isMobile;
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
        socket.emit("disconnect");
        socket.disconnect();
    };

    return (
        <div
            className={`flex ${isMobile ? "justify-between w-full" : "flex-col space-y-4 justify-evenly"
                } lg:space-y-10 h-full md:place-items-center`}
        >

            {/* Logout Confirmation Popup */}
            {showLogoutPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen top-0 ">
                    <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
                        <p className="text-lg text-slate-300 font-semibold mb-4">
                            Are you sure you want to logout?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setShowLogoutPopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-center w-8 h-8 md:w-16 md:h-16 lg:w-24 lg:h-24 xl:w-36 xl:h-36 bg-white rounded-full">
                <ProfilePicturePreview serverUrl={serverUrl} profilePicture={initialCurrentUser?.image || ''} />
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

            <div
                onClick={() => setShowLogoutPopup(true)}
                className="flex space-x-4 hover:bg-blue-700"
            >
                <div className="w-8 h-8">
                    <iconsFa.FaDoorOpen size={"100%"} className="text-slate-200" />
                </div>
                <div className="hidden xl:block text-slate-200 font-semibold text-xl">Logout</div>
            </div>

        </div>
    );
}
