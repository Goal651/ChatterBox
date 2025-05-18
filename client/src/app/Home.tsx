import { useEffect, useState } from "react";
import UserGroup from "./sections/UserGroup";
import { getGroupsApi } from "@/api/GroupApi";
import { fetchAllUsers } from "@/api/UserApi";
import ChatSection from "./sections/Chat";

export default function Home() {
    const [loading, setLoading] = useState(true)

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


    return (
        <div className="flex w-full bg-[#0f0f0f]">
            <UserGroup loading={loading} />
            <div className="border-r-2 h-screen border-[#252525]" />
            <ChatSection />
        </div>
    );
}
