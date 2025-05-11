import ChatBody from "../../components/shared/chatScreen/chatBody";
import ChatFooter from "../../components/shared/chatScreen/chatFooter";
import ChatHeader from "../../components/shared/chatScreen/chatHeader";

export default function ChatSection() {
    return (
        <div className="flex flex-col h-screen w-6xl  relative">
            <ChatHeader />
            <ChatBody />
            <ChatFooter />
        </div>
    )
}