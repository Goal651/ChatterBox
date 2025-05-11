import { useEffect } from "react";
import ChatScreen from "./sections/Chat";
import UserGroup from "./sections/UserGroup";
import { getUsersApi } from "../api/UserApi";
import { getGroupsApi } from "../api/GroupApi";

export default function Home() {

    useEffect(() => {
        const fetchInitialData = async () => {
            await getUsersApi()
            await getGroupsApi()
        }
        fetchInitialData()
    }, [])


    return (
        <div className="flex w-full bg-[#0f0f0f]">
            <UserGroup />
            <div className="border-r-2 h-screen border-[#252525]" />
            <ChatScreen />
        </div>
    );
}
