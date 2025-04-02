import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { verifyEmailApi } from "../apis/UserApi"; // Hypothetical API (add this)
import Popup from "../components/Popup"; // Reusable Popup component
import axios from "axios";


const VerifyEmail = ({ serverUrl }: { serverUrl: string }) => {
    const { token } = useParams<{ token: string }>(); // Type the param
    const navigate = useNavigate();
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error" | "loading" | null;
        message?: string;
    }>({ type: "loading", message: "Verifying your email..." });

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setFormStatus({ type: "error", message: "Invalid verification link." });
                return;
            }

            try {
                const data = await verifyEmailApi(serverUrl, token, navigate);
                if (data) {
                    setFormStatus({ type: "success", message: data.message || "Email verified successfully!" });
                    setTimeout(() => navigate("/login"), 2000); // Redirect after success
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    setFormStatus({
                        type: "error",
                        message: error.response.data.error || "Verification failed. The link may have expired.",
                    });
                } else {
                    setFormStatus({ type: "error", message: "An unexpected error occurred." });
                }
            }
        };
        verifyEmail();
    }, [token, serverUrl, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950">
            <div className="p-8 sm:p-12 bg-gray-900/95 shadow-xl rounded-2xl text-center max-w-md w-full transform transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 tracking-tight">Email Verification</h2>
                <p className="mt-4 text-gray-400 text-sm sm:text-base">
                    {formStatus.message}
                </p>
                {formStatus.type === "loading" && (
                    <div className="mt-4 flex justify-center">
                        <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                        </svg>
                    </div>
                )}
                {(formStatus.type === "success" || formStatus.type === "error") && (
                    <Link
                        to="/login"
                        className="mt-6 inline-block text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors duration-200"
                    >
                        Back to Login
                    </Link>
                )}
                {formStatus.type && formStatus.message && (
                    <Popup
                        type={formStatus.type}
                        message={formStatus.message}
                        onClose={() => setFormStatus({ type: null })}
                        duration={formStatus.type === "success" ? 2000 : undefined} // Auto-close success after 2s
                    />
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;