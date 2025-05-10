import ChatBody from "../../components/chatScreen/chatBody";
import ChatFooter from "../../components/chatScreen/chatFooter";
import ChatHeader from "../../components/chatScreen/chatHeader";

export default function ChatSection() {
    return (
        <div className="flex flex-col h-screen w-6xl p-4 gap-y-4 relative">
            <ChatHeader />
            <ChatBody />
            <ChatFooter />
        </div>
    )
}