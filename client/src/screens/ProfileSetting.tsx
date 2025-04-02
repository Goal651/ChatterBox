import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserApi, editUserPasswordApi, editUserProfilePictureApi } from "../apis/UserApi";
import Popup from "../components/Popup";

const ProfileSettings = ({ serverUrl }: { serverUrl: string }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error" | "loading" | null;
        message?: string;
    }>({ type: null });

    const handleUpdateUser = async () => {
        setFormStatus({ type: "loading", message: "Updating profile..." });
        try {
            const response = await updateUserApi(serverUrl, { username }, navigate);
            if (response) {
                setFormStatus({ type: "success", message: "Profile updated successfully!" });
            }
        } catch (error) {
            setFormStatus({ type: "error", message: "Failed to update profile." });
        }
    };

    const handleChangePassword = async () => {
        setFormStatus({ type: "loading", message: "Changing password..." });
        try {
            const response = await editUserPasswordApi(serverUrl, { oldPassword, newPassword }, navigate);
            if (response) {
                setFormStatus({ type: "success", message: "Password changed successfully!" });
            }
        } catch (error) {
            setFormStatus({ type: "error", message: "Failed to change password." });
        }
    };

    const handleUploadPicture = async () => {
        if (!profilePicture) return;
        setFormStatus({ type: "loading", message: "Uploading picture..." });
        try {
            const response = await editUserProfilePictureApi(serverUrl, profilePicture, navigate);
            if (response) {
                setFormStatus({ type: "success", message: "Profile picture updated!" });
            }
        } catch (error) {
            setFormStatus({ type: "error", message: "Failed to upload picture." });
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Old Password" type="password" />
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" type="password" />
            <input type="file" onChange={(e) => setProfilePicture(e.target.files?.[0] || null)} />
            <button onClick={handleUpdateUser}>Update Profile</button>
            <button onClick={handleChangePassword}>Change Password</button>
            <button onClick={handleUploadPicture}>Upload Picture</button>
            {formStatus.type && formStatus.message && (
                <Popup
                    type={formStatus.type}
                    message={formStatus.message}
                    onClose={() => setFormStatus({ type: null })}
                    duration={formStatus.type === "success" ? 2000 : undefined}
                />
            )}
        </div>
    );
};

export default ProfileSettings;