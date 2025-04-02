// src/components/Popup.tsx
import { useEffect } from "react";

interface PopupProps {
    type: "success" | "error" | "info";
    message: string;
    onClose: () => void;
    duration?: number; // Auto-close after X ms
}

export default function Popup({ type, message, onClose, duration = 3000 }: PopupProps) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const styles = {
        success: "bg-green-600/80 text-white",
        error: "bg-red-600/80 text-white",
        info: "bg-blue-600/80 text-white",
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
            <div className={`p-4 rounded-lg shadow-md ${styles[type]} flex items-center gap-2 max-w-sm`}>
                <span className="text-sm font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 focus:outline-none"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
