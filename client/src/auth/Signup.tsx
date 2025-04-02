import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { signupApi } from "../apis/UserApi"; // Import refactored API
import { SignupFormData } from "../interfaces/interfaces";
import Popup from "../components/Popup"; // Import reusable Popup component
import axios from "axios";

export default function SignUp({ serverUrl }: { serverUrl: string }) {
    const navigate = useNavigate();
    const [SignupFormData, setSignupFormData] = useState<SignupFormData>({
        names: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error" | "loading" | null;
        message?: string;
    }>({ type: null });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const nameRef = useRef<HTMLInputElement | null>(null);
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const confirmPasswordRef = useRef<HTMLInputElement | null>(null);

    // Password match validation
    useEffect(() => {
        const validatePasswordMatch = () => {
            const match = SignupFormData.password === SignupFormData.confirmPassword && SignupFormData.password.length >= 4;
            if (!match && SignupFormData.confirmPassword) {
                setFormStatus({ type: "error", message: "Passwords do not match" });
            } else {
                setFormStatus((prev) => (prev.type === "error" && prev.message === "Passwords do not match" ? { type: null } : prev));
            }
        };
        validatePasswordMatch();
    }, [SignupFormData.password, SignupFormData.confirmPassword]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target;
        if (type === "file" && files) {
            setSignupFormData((prev) => ({ ...prev, image: files[0] } as SignupFormData));
            setImagePreview(URL.createObjectURL(files[0]));
        } else {
            setSignupFormData((prev) => ({ ...prev, [name]: value }));
        }
        setFormStatus({ type: null }); // Clear status on input change
        const ref = {
            names: nameRef,
            username: usernameRef,
            email: emailRef,
            password: passwordRef,
            confirmPassword: confirmPasswordRef,
        }[name];
        ref?.current?.classList.remove("border-red-500", "focus:ring-red-500");
    };

    const validateForm = () => {
        let isValid = true;
        if (!SignupFormData.names || SignupFormData.names.length < 5 || SignupFormData.names.length > 30) {
            nameRef.current?.classList.add("border-red-500", "focus:ring-red-500");
            isValid = false;
        }
        if (!SignupFormData.username || SignupFormData.username.length < 3 || SignupFormData.username.length > 6) {
            usernameRef.current?.classList.add("border-red-500", "focus:ring-red-500");
            isValid = false;
        }
        if (!SignupFormData.email || !/\S+@\S+\.\S+/.test(SignupFormData.email)) {
            emailRef.current?.classList.add("border-red-500", "focus:ring-red-500");
            isValid = false;
        }
        if (!SignupFormData.password || SignupFormData.password.length < 4) {
            passwordRef.current?.classList.add("border-red-500", "focus:ring-red-500");
            isValid = false;
        }
        if (!SignupFormData.confirmPassword || SignupFormData.confirmPassword !== SignupFormData.password) {
            confirmPasswordRef.current?.classList.add("border-red-500", "focus:ring-red-500");
            isValid = false;
        }
        return isValid;
    };

    const handleImageUploadClick = () => fileInputRef.current?.click();

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setFormStatus({ type: "error", message: "Please fill out all fields correctly." });
            return;
        }

        setFormStatus({ type: "loading" });
        try {
            const data = new FormData();
            Object.entries(SignupFormData).forEach(([key, value]) => {
                console.log(key, value);
                if (key === "image" && value instanceof File) {
                    data.append(key, value);
                } else if (value) {
                    data.append(key, value as string);
                }
            });

            const response = await signupApi(serverUrl, data, navigate);
            if (response) {
                setFormStatus({ type: "success", message: "Sign up successful! Check your email." });
                setTimeout(() => navigate("/email-sent"), 2000); // Delay for user feedback
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 400 && error.response.data.message === "User exist") {
                    setFormStatus({ type: "error", message: "Email already exists." });
                } else {
                    setFormStatus({
                        type: "error",
                        message: error.response.data.message || "An error occurred. Please try again.",
                    });
                }
            } else {
                setFormStatus({ type: "error", message: "An unexpected error occurred." });
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950 py-10">
            <form
                className="w-full max-w-md p-8 bg-gray-900/95 rounded-2xl shadow-xl space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 transform transition-all duration-300 hover:shadow-2xl"
                onSubmit={handleFormSubmit}
            >
                <h1 className="text-3xl font-bold text-center text-gray-200 tracking-tight">Sign Up</h1>

                {/* Image Upload */}
                <div className="flex justify-center">
                    <div
                        onClick={handleImageUploadClick}
                        className="relative w-32 h-32 rounded-full bg-gray-800/80 flex items-center justify-center cursor-pointer hover:bg-gray-700/80 transition-all duration-200 shadow-md group"
                    >
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Profile Preview"
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-5xl font-extrabold text-gray-200">
                                {SignupFormData.names.slice(0, 1).toUpperCase() || "U"}
                            </span>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-white text-sm font-medium">Upload</span>
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        name="image"
                        accept="image/*"
                        className="hidden"
                        onChange={handleInputChange}
                    />
                </div>

                {/* Form Fields */}
                <div className="space-y-1">
                    <input
                        name="names"
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm"
                        required
                        placeholder="Full Name"
                        onChange={handleInputChange}
                        minLength={5}
                        maxLength={30}
                        ref={nameRef}
                    />
                    <p className="text-gray-400 text-xs ml-2">5-30 characters</p>
                </div>
                <div className="space-y-1">
                    <input
                        name="username"
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm"
                        required
                        placeholder="Username"
                        onChange={handleInputChange}
                        minLength={3}
                        maxLength={6}
                        ref={usernameRef}
                    />
                    <p className="text-gray-400 text-xs ml-2">3-6 characters</p>
                </div>
                <div className="space-y-1">
                    <input
                        name="email"
                        type="email"
                        className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm"
                        required
                        placeholder="Email"
                        onChange={handleInputChange}
                        ref={emailRef}
                    />
                    <p className="text-gray-400 text-xs ml-2">Enter a valid email</p>
                </div>
                <div className="space-y-1">
                    <input
                        name="password"
                        type="password"
                        className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm"
                        required
                        placeholder="Password"
                        onChange={handleInputChange}
                        minLength={4}
                        ref={passwordRef}
                    />
                    <p className="text-gray-400 text-xs ml-2">Minimum 4 characters</p>
                </div>
                <div className="space-y-1">
                    <input
                        name="confirmPassword"
                        type="password"
                        className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm"
                        required
                        placeholder="Confirm Password"
                        onChange={handleInputChange}
                        ref={confirmPasswordRef}
                    />
                </div>

                {/* Submit Button and Link */}
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
                                Signing Up...
                            </>
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                    <Link
                        to="/login"
                        className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors duration-200"
                    >
                        Already have an account? Login
                    </Link>
                </div>
                {formStatus.type && formStatus.message && (
                    <Popup
                        type={formStatus.type}
                        message={formStatus.message}
                        onClose={() => setFormStatus({ type: null })}
                        duration={formStatus.type === "success" ? 2000 : undefined} // Auto-close success after 2s
                    />
                )}
            </form>
        </div>
    );
}