import { useEffect, useState } from "react";
import UserGroup from "./sections/UserGroup";
import { useSocket } from "@/context/SocketContext";
import { fetchAllUsers } from "@/api/UserApi";
import { getGroupsApi } from "@/api/GroupApi";
import { useParams } from "react-router-dom";
import DmChatSection from "./sections/DmChat";
import GroupChatSection from "./sections/GroupChat";

export default function Home() {
    const { socket } = useSocket()
    const params = useParams()
    const [tabSection, setTabSection] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const { tab } = params as { tab: string }
        setTabSection(tab)
    }, [params])


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true)
                await fetchAllUsers();
                await getGroupsApi()
                setLoading(false)
            } catch (e) {
                console.error(e)
                setLoading(false)
            }
        }
        fetchInitialData()
    }, [])

    useEffect(() => {
        if (socket) {
            socket.on("connect", () => { console.log('Connected') });
            socket.on("connect_error", () => { console.log('Error') });
            return () => {
                socket.off("connect",)
                socket.off("connect_error",);
            };
        }
    }, [socket])


    return (
        <div className="flex w-full bg-[#0f0f0f]">
            <UserGroup loading={loading} />
            <div className="border-r-2 h-screen border-[#252525]" />
            {tabSection == 'dm' && (<DmChatSection />)}
            {tabSection == 'grp' && (<GroupChatSection />)}

        </div>
    );
}
