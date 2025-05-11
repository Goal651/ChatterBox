import { useEffect, useState } from "react";
import {
    AiOutlineCheckCircle,
    AiOutlineCloseCircle,
    AiOutlineInfoCircle,
    AiOutlineWarning,
} from "react-icons/ai";
import { setNotificationHandler } from "../../utils/NotificationService";

const iconMap = {
    success: <AiOutlineCheckCircle size={24} />,
    error: <AiOutlineCloseCircle size={24} />,
    info: <AiOutlineInfoCircle size={24} />,
    warning: <AiOutlineWarning size={24} />,
};

const bgMap: Record<string, string> = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-500 text-black",
};

export default function Notification() {
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"success" | "error" | "info" | "warning">("info");
    const [visible, setVisible] = useState(false);

    const handleNotification = (
        msg: string,
        kind: "success" | "error" | "info" | "warning"
    ) => {
        setMessage(msg);
        setType(kind);
        setVisible(true);
    };

    useEffect(() => {
        setNotificationHandler(handleNotification);
    }, []);

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(() => setVisible(false), 5000);
        return () => clearTimeout(timer);
    }, [visible]);

    if (!visible) return null;

    return (
        <div
            className={`fixed top-5 left-1/2 z-50 -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-out ${bgMap[type]}`}
        >
            {iconMap[type]}
            <span className="text-sm">{message}</span>
        </div>
    );
}
