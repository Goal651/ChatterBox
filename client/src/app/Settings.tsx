import * as iconsFa from "react-icons/fa";
import { useEffect, useState } from "react";
import { User } from "../interfaces/interfaces";
import { editUserPassword } from "../api/AuthApi";
import ProfilePicturePreview from "../components/shared/ProfilePicturePreview";
import { updateUserApi } from "../api/UserApi";

interface ProfileDataType {
    username: string;
    names: string;
    email: string;
    profilePicture: string;
}

export default function Setting({ userData}: { userData: User | null;  }) {
    const [isProfileOpen, setIsProfileOpen] = useState(true);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [profileData, setProfileData] = useState<ProfileDataType>({
        username: userData?.username || "",
        names: userData?.names || "",
        email: userData?.email || "",
        profilePicture: '',
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [notification, setNotification] = useState({
        message: "",
        type: "",
        visible: false,
    });

    useEffect(() => {
        setProfileData((prev) => ({
            ...prev,
            username: userData?.username || "",
            names: userData?.names || "",
            email: userData?.email || "",
            profilePicture: userData?.image || "",
        }));
    }, [userData]);

    useEffect(() => {
        const compareObject = {
            username: userData?.username || "",
            names: userData?.names || "",
            email: userData?.email || "",
        };
        setIsUpdating(JSON.stringify(compareObject) !== JSON.stringify({ ...profileData, profilePicture: null }));
    }, [userData, profileData]);

    useEffect(() => {
        setPasswordMatch(passwordData.newPassword === passwordData.confirmPassword);
    }, [passwordData]);

    const profileDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, name } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNotification = (message: string, type: "success" | "error") => {
        setNotification({ message, type, visible: true });
        setTimeout(() => setNotification((prev) => ({ ...prev, visible: false })), 3000);
    };

    const handleProfileEdition = async () => {
        const submitObject = {
            email: profileData.email,
            username: profileData.username,
            names: profileData.names
        };
        setIsSubmitting(true);
        try {
            await updateUserApi(submitObject);
            handleNotification("Profile updated successfully!", "success");
            setIsSubmitting(false);
        } catch (error) {
            handleNotification("Failed to update profile.", "error");
            setIsSubmitting(false);
            console.error(error);
        }
    };

    const handlePasswordEdition = async () => {
        try {
            setIsSubmittingPassword(true);
            await editUserPassword( passwordData);
            handleNotification("Password updated successfully!", "success");
            setIsSubmittingPassword(false);
        } catch (error) {
            handleNotification("Failed to update password.", "error");
            setIsSubmittingPassword(false);
            console.error(error);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-8 space-y-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen  overflow-y-auto overflow-x-hidden">
            <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-md">Settings</h1>

            {notification.visible && (
                <div
                    className={`fixed top-8 right-8 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 ease-in-out ${notification.type === "success" ? "bg-green-600" : "bg-red-600"} text-white font-semibold animate-slide-in`}
                >
                    {notification.message}
                </div>
            )}

            {/* Profile Settings */}
            <div className="w-full max-w-lg bg-gray-800/90 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-sm">
                <div
                    className="text-2xl font-semibold text-gray-100 mb-6 flex items-center cursor-pointer"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                    <iconsFa.FaUser className="mr-3 text-blue-400" />
                    Profile Settings
                    <iconsFa.FaChevronDown
                        className={`ml-auto text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
                    />
                </div>
                {isProfileOpen && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="relative group w-60 h-60">
                                <ProfilePicturePreview
                                    profilePicture={profileData.profilePicture}
                                    username={profileData.username}
                                    textSize="text-7xl"
                                    className="rounded-full border-4 border-gray-700 transition-transform duration-300 group-hover:scale-105 group-hover:border-blue-500"
                                />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                name="names"
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-200 bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                value={profileData?.names}
                                onChange={profileDataChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-200 bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                value={profileData?.username}
                                onChange={profileDataChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-200 bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                value={profileData?.email}
                                onChange={profileDataChange}
                            />
                        </div>
                        <button
                            disabled={!isUpdating || isSubmitting}
                            onClick={handleProfileEdition}
                            className={`w-full px-4 py-3 rounded-lg text-white font-semibold transition-all duration-300 ${isSubmitting ? "bg-blue-700 cursor-not-allowed" : isUpdating ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg" : "bg-gray-600 cursor-not-allowed opacity-70"}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Account Settings */}
            <div className="w-full max-w-lg bg-gray-800/90 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-sm">
                <div
                    className="text-2xl font-semibold text-gray-100 mb-6 flex items-center cursor-pointer"
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                >
                    <iconsFa.FaLock className="mr-3 text-green-400" />
                    Security Settings
                    <iconsFa.FaChevronDown
                        className={`ml-auto text-gray-400 transition-transform duration-300 ${isAccountOpen ? "rotate-180" : ""}`}
                    />
                </div>
                {isAccountOpen && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Old Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                placeholder="Enter old password"
                                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-200 bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="Enter new password"
                                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-200 bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-200 bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                        </div>
                        {!passwordMatch && passwordData.confirmPassword && (
                            <p className="text-red-400 text-sm font-medium animate-pulse bg-red-900/20 px-3 py-1 rounded-md">Passwords do not match</p>
                        )}
                        <button
                            disabled={isSubmittingPassword}
                            onClick={handlePasswordEdition}
                            className={`w-full px-4 py-3 rounded-lg text-white font-semibold transition-all duration-300 ${isSubmittingPassword ? "bg-green-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 hover:shadow-lg"}`}
                        >
                            {isSubmittingPassword ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                                    </svg>
                                    Updating...
                                </span>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}