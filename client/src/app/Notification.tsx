import NotificationComponent from "@/components/notification/Notification"
import { FaCheckDouble } from "react-icons/fa6"

export default function Notifications() {
    return (
        <div className="flex w-full bg-[#0f0f0f] h-full  p-4 items-center justify-center">
            <div className="flex flex-col gap-y-4 bg-[#1a1a1a] p-4 rounded-xl h-full min-w-2xl">
               <div className="flex  justify-between items-center">
                 <div className="text-2xl font-bold">Notifications</div>
                 <div className="btn flex items-center gap-x-2  text-blue-400">
                    <FaCheckDouble className="w-4 h-4"/>
                    <span>
                    Mark all as read</span></div>
               </div>
               <div className="flex flex-col gap-y-4 overflow-y-auto">
                <NotificationComponent/>
                <NotificationComponent/>
                <NotificationComponent/>
                <NotificationComponent/>
                <NotificationComponent/>
                <NotificationComponent/>
                <NotificationComponent/>
                <NotificationComponent/>
               </div>
            </div>
        </div>
    )
}