import { FaDoorOpen, FaGear } from "react-icons/fa6";
import { User } from "@/types/interfaces";
import ProfilePicturePreview from "@/components/common/ProfilePicturePreview";
import { useNavigate } from "react-router-dom";

export default function SideBarSetting({ initialCurrentUser }: { initialCurrentUser: User }) {
    const navigate = useNavigate()
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };
    return (
        <div className="flex flex-col gap-y-2">
            <div className="btn btn-square bg-[#252525] border-0 text-black font-bold shadow  rounded-lg"
            onClick={()=>navigate('/settings/profile')}>
                <FaGear color="white" />
            </div>
            <div className="btn btn-square rounded-full bg-black shadow shadow-gray-400 "
            onClick={()=>navigate('/settings/profile')}>
                <ProfilePicturePreview
                    profilePicture={initialCurrentUser?.image || ''}
                    username={initialCurrentUser?.username || 'U'}
                    textSize="text-2xl"
                />
            </div>

            <div
                onClick={() => {
                    const modal = document.getElementById('my_modal_5') as HTMLDialogElement;
                    modal?.showModal();
                }}
                className="btn btn-square bg-[#252525] border-0 text-black font-bold shadow  rounded-lg mt-8"
            >
                <FaDoorOpen color="white"/>

            </div>


            {/* Logout Modal */}
            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-[#1a1a1a] rounded-xl shadow-xl p-6">
                    <p className="text-lg text-gray-200 font-semibold mb-6">Are you sure you want to logout?</p>
                    <div className="modal-action flex gap-4">
                        <form method="dialog">
                            <button className="btn px-4 py-2 bg-[#0f0f0f] text-gray-200 rounded-lg hover:bg-black/70 transition-all duration-200 shadow-md">Cancel</button>
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
    )
}