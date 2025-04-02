import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pingServerApi } from "../apis/MainApi"; // Import refactored API
import Popup from "../components/Popup"; // Reusable Popup component

const NetworkChecker = ({ serverUrl }: { serverUrl: string }) => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [serverStatus, setServerStatus] = useState<"up" | "down" | "unknown">("unknown");
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error" | "loading" | null;
        message?: string;
    }>({ type: "loading", message: "Checking network status..." });

    const checkServerStatus = async () => {
        setFormStatus({ type: "loading", message: "Pinging server..." });
        try {
            const response = await pingServerApi(serverUrl, navigate);
            if (response) {
                setServerStatus("up");
                setFormStatus({ type: "success", message: "Server is online!" });
            }
        } catch (error) {
            setServerStatus("down");
            setFormStatus({ type: "error", message: "Server is unreachable. Retrying soon..." });
        }
    };

    useEffect(() => {
        const checkInternetStatus = () => {
            if (navigator.onLine) {
                setIsOnline(true);
                checkServerStatus();
            } else {
                setIsOnline(false);
                setServerStatus("unknown");
                setFormStatus({ type: "error", message: "No internet connection detected." });
            }
        };

        // Initial check
        checkInternetStatus();

        // Continuous ping every 5 seconds
        const interval = setInterval(() => {
            if (navigator.onLine) {
                checkServerStatus();
            } else {
                setServerStatus("unknown");
                setFormStatus({ type: "error", message: "No internet connection detected." });
            }
        }, 5000);

        // Handle online/offline events
        window.addEventListener("online", checkInternetStatus);
        window.addEventListener("offline", checkInternetStatus);

        return () => {
            clearInterval(interval);
            window.removeEventListener("online", checkInternetStatus);
            window.removeEventListener("offline", checkInternetStatus);
        };
    }, [serverUrl, navigate]);

    useEffect(() => {
        if (isOnline && serverStatus === "up") {
            setTimeout(() => navigate("/"), 2000); // Delay for user feedback
        }
    }, [isOnline, serverStatus, navigate]);

    const handleRetry = () => {
        if (navigator.onLine) {
            checkServerStatus();
        } else {
            setFormStatus({ type: "error", message: "Please connect to the internet to retry." });
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950 text-white text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-200 tracking-tight">
                {isOnline ? "Internet Connected" : "No Internet Connection"}
            </h1>
            <p className="mt-4 text-gray-400 text-sm sm:text-base">
                {isOnline
                    ? serverStatus === "up"
                        ? "Server is running"
                        : "Server is down"
                    : "Unable to check server status while offline."}
            </p>
            <div className="mt-6 flex items-center gap-4">
                <span
                    className={`px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all duration-200 ${
                        isOnline
                            ? serverStatus === "up"
                                ? "bg-green-600/80 text-white"
                                : "bg-red-600/80 text-white"
                            : "bg-gray-600/80 text-gray-300"
                    }`}
                >
                    {isOnline
                        ? serverStatus === "up"
                            ? "Server: Up"
                            : "Server: Down"
                        : "Offline"}
                </span>
                {serverStatus !== "up" && (
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
                    >
                        Retry Now
                    </button>
                )}
            </div>
            {formStatus.type && formStatus.message && (
                <Popup
                    type={formStatus.type}
                    message={formStatus.message}
                    onClose={() => setFormStatus({ type: null })}
                    duration={formStatus.type === "success" ? 2000 : undefined} // Auto-close success after 2s
                />
            )}
        </div>
    );
};

export default NetworkChecker;