import { useEffect, useState } from "react";
import ChatScreen from "./sections/Chat";
import UserGroup from "./sections/UserGroup";
import { getUsersApi } from "../api/UserApi";
import { getGroupsApi } from "../api/GroupApi";

export default function Home() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true)
            await getUsersApi()
            await getGroupsApi()
            setLoading(false)
        }
        fetchInitialData()
    }, [])


    return (
        <div className="flex w-full bg-[#0f0f0f]">
            <UserGroup loading={loading} />
            <div className="border-r-2 h-screen border-[#252525]" />
            <ChatScreen />
        </div>
    );
}
