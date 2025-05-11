import { FaCommentDots} from "react-icons/fa6";


export default function SideBarLocations() {



    return (
        <div className="flex flex-col gap-2">

            <div className="btn btn-square bg-[#252525] rounded-lg border-0 text-black font-bold shadow ">
                <img src="/AppIcon.png" alt="" />
            </div>
            <div className="btn btn-square bg-[#252525] border-0 rounded-lg text-gray-200 font-bold shadow ">+</div>
            <div className="btn btn-square bg-[#252525] border-0 rounded-lg text-gray-200 font-bold shadow "
            >
                <FaCommentDots />
            </div>

        </div>
    )
}

