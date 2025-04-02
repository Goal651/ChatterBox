import React, { useState, ReactNode } from "react";
import Popup from "../components/Popup"; // Adjust path as needed

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode; // Optional custom fallback UI
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleErrorReset = () => {
        setHasError(false);
        setErrorMessage(null);
    };

    const DefaultFallback = () => (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950 text-white text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-200 tracking-tight">
                Something Went Wrong
            </h1>
            <p className="mt-4 text-gray-400 text-sm sm:text-base">
                An unexpected error occurred. Please try again or refresh the page.
            </p>
            <button
                onClick={handleErrorReset}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
            >
                Try Again
            </button>
        </div>
    );

    // Component to catch rendering errors
    const ErrorCatcher: React.FC<{ children: ReactNode }> = ({ children }) => {
        try {
            return <>{children}</>;
        } catch (error) {
            console.error("Uncaught error:", error);
            setHasError(true);
            setErrorMessage(
                error instanceof Error ? error.message : "An unexpected error occurred."
            );
            return null;
        }
    };

    if (hasError) {
        return (
            <>
                {fallback || <DefaultFallback />}
                {errorMessage && (
                    <Popup
                        type="error"
                        message={errorMessage}
                        onClose={handleErrorReset}
                    />
                )}
            </>
        );
    }

    return <ErrorCatcher>{children}</ErrorCatcher>;
};

export default ErrorBoundary;