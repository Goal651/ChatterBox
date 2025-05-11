import ChatScreen from "./sections/Chat";
import UserGroup from "./sections/UserGroup";

export default function Home() {


    return (
        <div className="flex w-full bg-[#0f0f0f]">
            <UserGroup />
            <div className="border-r-2 h-screen border-[#252525]" />
            <ChatScreen />
        </div>
    );
}
