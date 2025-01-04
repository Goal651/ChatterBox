import * as iconsFa from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { User } from "../interfaces/interfaces"
import { Socket } from "socket.io-client"

interface NavigatorProps {
    initialCurrentUser: User | null,
    socket: Socket,
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
}

export default function Navigator({ initialCurrentUser, socket, mediaType }: NavigatorProps) {
    const navigate = useNavigate()
    const isMobile = mediaType.isMobile

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
        socket.emit('disconnect')
    }

    return (
        <div className={`flex ${isMobile ? ' justify-between w-full  ' : ' flex-col space-y-4  justify-evenly '}  lg:space-y-10 h-full md:place-items-center`}>
            <div className="flex justify-center">
                <img
                    src={initialCurrentUser?.imageData ? initialCurrentUser.imageData : '/image.png'}
                    className="bg-transparent rounded-full object-cover w-8 h-8 md:w-16 md:h-16 lg:w-24 lg:h-24 xl:w-36 xl:h-36 "
                />
            </div>
            <div className={`flex ${isMobile ? 'justify-evenly ' : 'justify-center space-y-2 flex-col'}   md:space-y-4 lg:space-y-8 xl:space-y-14`}>
                <div className="flex space-x-4">
                    <div className="w-8 h-8">
                        <iconsFa.FaHome size={'100%'} className="text-slate-200" />
                    </div>
                    <div className="hidden xl:block text-slate-200 font-semibold text-xl">Home</div>
                </div>
                <div className="flex space-x-4">
                    <div className="w-8 h-8">
                        <iconsFa.FaRegCommentDots size={'100%'} className="text-slate-200" />
                    </div>
                    <div className="hidden xl:block text-slate-200 font-semibold text-xl">Chats</div>
                </div>
                <div className="flex space-x-4">
                    <div className="w-8 h-8">
                        <iconsFa.FaBell size={'100%'} className="text-slate-200" />
                    </div>
                    <div className="hidden xl:block text-slate-200 font-semibold text-xl">Notification</div>
                </div >
                <div className="flex space-x-4">
                    <div className="w-8 h-8">
                        <iconsFa.FaCog size={'100%'} className="text-slate-200" />
                    </div>
                    <div className="hidden xl:block text-slate-200 font-semibold text-xl">Setting</div>
                </div>
            </div>

            <div
                onClick={handleLogout}
                className="flex  space-x-4 hover:bg-blue-700">
                <div className="w-8 h-8">
                    <iconsFa.FaDoorOpen size={'100%'} className="text-slate-200" />
                </div>
                <div className="hidden xl:block text-slate-200 font-semibold text-xl">Logout</div>
            </div>
        </div>
    )
}