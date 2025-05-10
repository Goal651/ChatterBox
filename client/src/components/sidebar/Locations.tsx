import { FaCommentDots } from "react-icons/fa6";

export default function SideBarLocations() {
    return (
        <div className="flex flex-col gap-2">

            <div className="btn btn-square bg-gray-600 rounded-lg border-0 text-black font-bold shadow shadow-gray-400">
                <img src="/AppIcon.png" alt="" />
                </div> 
            <div className="btn btn-square bg-white border-0 rounded-lg text-black font-bold shadow shadow-gray-400">+</div>
            <div className="btn btn-square bg-white border-0 rounded-lg text-black font-bold shadow shadow-gray-400">
                <FaCommentDots />
            </div>
        </div>
    )
}

