import * as iconsFa from "react-icons/fa";
import { useEffect, useState } from "react";
import { User } from "../interfaces/interfaces";
import { editUserPassword, updateUserApi } from "../api/api";
import ProfilePicturePreview from "../utilities/ProfilePicturePreview";

interface ProfileDataType {
    username: string;
    names: string;
    email: string;
    profilePicture: string
}

export default function Setting({ userData, serverUrl }: { userData: User | null; serverUrl: string }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [profileData, setProfileData] = useState<ProfileDataType>({
        username: userData?.username || "",
        names: userData?.names || "",
        email: userData?.email || "",
        profilePicture: '',
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(false);

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
        const formData = new FormData();
        formData.append("username", profileData.username);
        formData.append("names", profileData.names);
        formData.append("email", profileData.email);
        if (profileData.profilePicture) {
            formData.append("profilePicture", profileData.profilePicture);
        }

        try {
            const res = await updateUserApi(serverUrl, formData);
            handleNotification("Profile updated successfully!", "success");
            console.log(res);
        } catch (error) {
            handleNotification("Failed to update profile.", "error");
            console.log(error);
        }
    };

    const handlePasswordEdition = async () => {
        try {
            const res = await editUserPassword(serverUrl, passwordData);
            handleNotification("Password updated successfully!", "success");
            console.log(res);
        } catch (error) {
            handleNotification("Failed to update password.", "error");
            console.log(error);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-6 space-y-6 bg-black h-full rounded-2xl overflow-y-auto overflow-x-hidden">
            <h1 className="text-2xl font-bold text-gray-500">Settings</h1>

            {notification.visible && (
                <div
                    className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-500" : "bg-red-500"
                        } text-white`}
                >
                    {notification.message}
                </div>
            )}

            {/* Profile Settings */}
            <div className="w-full max-w-md bg-slate-800 p-4 rounded-lg shadow-md">
                <div
                    className="text-xl font-semibold text-gray-700 mb-4 flex items-center cursor-pointer"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                    <iconsFa.FaUser className="mr-2 text-blue-500" />
                    Profile Settings
                    <iconsFa.FaChevronDown
                        className={`ml-auto transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                    />
                </div>
                {isProfileOpen && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Profile Picture</label>
                            <div
                                className="flex items-center justify-center cursor-pointer">
                                <ProfilePicturePreview profilePicture={profileData.profilePicture} serverUrl={serverUrl} />

                            </div>
                          
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Full Name</label>
                            <input
                                type="text"
                                name="names"
                                placeholder="Enter your full name"
                                className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900"
                                value={profileData?.names}
                                onChange={profileDataChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900"
                                value={profileData?.username}
                                onChange={profileDataChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900"
                                value={profileData?.email}
                                onChange={profileDataChange}
                            />
                        </div>
                    </div>
                )}
                <button
                    disabled={!isUpdating}
                    onClick={handleProfileEdition}
                    className={`mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md ${isUpdating ? "" : "bg-slate-600 hover:bg-slate-700"
                        }`}
                >
                    Save Changes
                </button>
            </div>

            {/* Account Settings */}
            <div className="w-full max-w-md bg-slate-800 p-4 rounded-lg shadow-md">
                <div
                    className="text-xl font-semibold text-gray-700 mb-4 flex items-center cursor-pointer"
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                >
                    <iconsFa.FaLock className="mr-2 text-green-500" />
                    Security Settings
                    <iconsFa.FaChevronDown
                        className={`ml-auto transition-transform ${isAccountOpen ? "rotate-180" : ""}`}
                    />
                </div>
                {isAccountOpen && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Old Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                placeholder="Enter old password"
                                className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="Enter new password"
                                className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                        </div>
                        {!passwordMatch && <p className="text-red-500 text-sm">Passwords do not match</p>}
                    </div>
                )}
                <button
                    onClick={handlePasswordEdition}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                    Update Password
                </button>
            </div>
        </div>
    );
}
