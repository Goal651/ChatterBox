import React from "react";

interface LoadingPageProps {
    message?: string; // Optional custom message
    size?: "sm" | "md" | "lg"; // Spinner size variant
    fullscreen?: boolean; // Toggle fullscreen mode
}

const LoadingPage: React.FC<LoadingPageProps> = ({
    message = "Loading, please wait...",
    size = "md",
    fullscreen = true,
}) => {
    const sizeStyles = {
        sm: "h-12 w-12 border-t-2",
        md: "h-24 w-24 border-t-4",
        lg: "h-32 w-32 border-t-6",
    };

    return (
        <div
            className={`flex items-center justify-center bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950 ${
                fullscreen ? "fixed top-0 left-0 z-50 h-screen w-screen" : "relative h-full w-full"
            }`}
        >
            <div className="flex flex-col items-center space-y-6">
                <div
                    className={`animate-spin rounded-full ${sizeStyles[size]} border-blue-500 border-opacity-75 shadow-md animate-pulse`}
                    aria-label="Loading spinner"
                />
                <p className="text-gray-300 text-lg font-semibold tracking-tight animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingPage;