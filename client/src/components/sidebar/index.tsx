import { useEffect, useState } from "react";
import SideBarLocations from "./Locations";
import SideBarSetting from "./Setting";
import { User } from "@/types/interfaces";

export default function SideBar() {
    const [initialCurrentUser, setInitialCurrentUser] = useState<User>({
        _id: '',
        username: '',
        names: '',
        email: '',
        image: '',
        lastActiveTime: new Date(),
        unreads: [],
        latestMessage: {
            _id: '',
            sender: '',
            message: '',
            receiver: '',
            isMessageSeen: false,
            edited: false,
            isMessageSent: false,
            isMessageReceived: false,
            reactions: [],
            replying: null,
            type: '',
            createdAt: new Date()
        }
    })
    useEffect(() => {
        const user = localStorage.getItem('user')
        if (user) setInitialCurrentUser(JSON.parse(user))
    }, [])
    return (
        <div className="flex flex-col h-full max-w-[10%] justify-between p-4 border-r-2 border-[#252525] bg-[#0f0f0f]">
            <SideBarLocations />
            <SideBarSetting initialCurrentUser={initialCurrentUser} />
        </div>
    )
}