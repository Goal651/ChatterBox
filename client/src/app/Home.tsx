import { useEffect } from "react";
import ChatScreen from "./sections/Chat";
import UserGroup from "./sections/UserGroup";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const router = useNavigate()

    // useEffect(() => {
    //     const checkUser = () => {
    //         const token = localStorage.getItem('token')
    //         if (!token) router('/login')
    //     }
    //     checkUser()
    // }, [router])

    return (
        <div className="flex w-full">
            <UserGroup />
            <div className="border-r-2 h-screen border-gray-300" />
            <ChatScreen />
        </div>
    );
}
