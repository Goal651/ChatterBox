import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Popup from "../components/Popup"; // Reusable Popup component
import { signupApi } from "../apis/UserApi"; // Hypothetical resend API (adjust as needed)

const EmailSent = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get("email") || "your email"; // Fallback if email is missing
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error" | "loading" | null;
        message?: string;
    }>({ type: null });

    const handleResendEmail = async () => {
        setFormStatus({ type: "loading" });
        try {
            // Hypothetical API call to resend verification email
            // Replace with your actual API if available
            const response = await signupApi(
                "http://your-server-url", // Replace with your serverUrl prop
                { email } as any, // Adjust payload based on your backend
                navigate
            );
            if (response) {
                setFormStatus({ type: "success", message: "Verification email resent successfully!" });
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setFormStatus({
                    type: "error",
                    message: error.response.data.message || "Failed to resend email. Please try again.",
                });
            } else {
                setFormStatus({ type: "error", message: "An unexpected error occurred." });
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950">
            <div className="p-8 sm:p-12 bg-gray-900/95 shadow-xl rounded-2xl text-center max-w-md w-full transform transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 tracking-tight">Verification Email Sent</h2>
                <p className="mt-4 text-gray-400 text-sm sm:text-base">
                    A verification email has been sent to{" "}
                    <span className="font-semibold text-gray-200">{email}</span>. Please check your inbox and click the link to verify your email.
                </p>
                <p className="mt-2 text-gray-500 text-xs sm:text-sm">If you don’t see the email, check your spam or junk folder.</p>
                
                {/* Resend Button */}
                <button
                    onClick={handleResendEmail}
                    disabled={formStatus.type === "loading"}
                    className={`mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${formStatus.type === "loading" ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-lg"}`}
                >
                    {formStatus.type === "loading" ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                            </svg>
                            Resending...
                        </>
                    ) : (
                        "Resend Email"
                    )}
                </button>

                {/* Back to Login Link */}
                <p className="mt-4 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors duration-200 cursor-pointer" onClick={() => navigate("/login")}>
                    Back to Login
                </p>

                {/* Popup for Feedback */}
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

export default EmailSent;