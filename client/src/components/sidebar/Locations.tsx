import { FaCommentDots, FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";


export default function SideBarLocations() {
    const router = useNavigate()

    return (
        <div className="flex flex-col gap-2">

            <div className="btn btn-square bg-[#252525] rounded-lg border-0 text-black font-bold shadow "
                onClick={() => router('/')}>
                <img src="/AppIcon.png" alt="" />
            </div>
            <div className="btn btn-square bg-[#252525] border-0 rounded-lg text-gray-200 font-bold shadow "
                onClick={() => router('/newGroup')} >
                <FaPlus />
            </div>
            <div className="btn btn-square bg-[#252525] border-0 rounded-lg text-gray-200 font-bold shadow "
                onClick={() => router('/chat')}  >
                <FaCommentDots />
            </div>

        </div>
    )
}

