import ChatScreen from "./sections/Chat";
import UserGroup from "./sections/UserGroup";

export default function Home() {
    return (
        <div className="flex w-full">
            <UserGroup />
            <div className="border-r-2 h-screen border-gray-300"/>
            <ChatScreen />
        </div>
    );
}
