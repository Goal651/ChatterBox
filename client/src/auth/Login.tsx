import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { loginApi, checkTokenApi } from "../apis/UserApi"; // Import refactored APIs
import Popup from "../components/Popup"; // Import reusable Popup component

interface LoginProps {
    serverUrl: string;
    status: (data: boolean) => void;
}

export default function Login({ serverUrl, status }: LoginProps) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error" | "loading" | null;
        message?: string;
    }>({ type: null });
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const token = localStorage.getItem("token");

    // Check token on mount
    useEffect(() => {
        if (token) {
            const checkUser = async () => {
                setFormStatus({ type: "loading" });
                try {
                    await checkTokenApi(serverUrl, navigate);
                    setFormStatus({ type: "success", message: "Already logged in, redirecting..." });
                    setTimeout(() => navigate("/chat/"), 1000);
                } catch (error) {
                    console.error("Error checking user:", error);
                    localStorage.clear();
                    sessionStorage.clear();
                    setFormStatus({ type: "error", message: "Session expired. Please log in again." });
                }
            };
            checkUser();
        }
    }, [token, serverUrl, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormStatus({ type: null }); // Clear status on input change
        const ref = name === "email" ? emailRef : passwordRef;
        ref.current?.classList.remove("border-red-500", "focus:ring-red-500");
    };

    const validateForm = () => {
        let isValid = true;
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            emailRef.current?.classList.add("border-red-500", "focus:ring-red-500");
            isValid = false;
        }
        if (!formData.password || formData.password.length < 4) {
            passwordRef.current?.classList.add("border-red-500", "focus:ring-red-500");
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setFormStatus({ type: "error", message: "Please enter a valid email and password (min 4 characters)." });
            return;
        }

        setFormStatus({ type: "loading" });
        try {
            const data = await loginApi(serverUrl, formData.email, formData.password, navigate);
            if (data) {
                setFormStatus({ type: "success", message: "Logged in successfully!" });
                status(true);
                localStorage.setItem("token", data.accessToken);
                setTimeout(() => navigate("/chat/"), 1000); // Delay for user to see success
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setFormStatus({
                    type: "error",
                    message: error.response.data.message || "Login failed. Please try again.",
                });
            } else {
                setFormStatus({ type: "error", message: "An unexpected error occurred." });
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-900/95 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-200 tracking-tight">Login</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
                    <div className="space-y-1">
                        <input
                            className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm"
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            ref={emailRef}
                            required
                        />
                        <p className="text-gray-400 text-xs ml-2 hidden peer-invalid:block">Enter a valid email address</p>
                    </div>
                    <div className="space-y-1">
                        <input
                            className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm"
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            ref={passwordRef}
                            minLength={4}
                            required
                        />
                        <p className="text-gray-400 text-xs ml-2 hidden peer-invalid:block">Password must be at least 4 characters</p>
                    </div>
                    <div className="flex flex-col items-center gap-y-4">
                        <button
                            type="submit"
                            disabled={formStatus.type === "loading"}
                            className={`w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${formStatus.type === "loading" ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-lg"}`}
                        >
                            {formStatus.type === "loading" ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                                    </svg>
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                        <Link
                            to="/signup"
                            className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors duration-200"
                        >
                            Don’t have an account? Sign Up
                        </Link>
                    </div>
                </form>
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
}