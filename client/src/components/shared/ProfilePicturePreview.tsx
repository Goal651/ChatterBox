import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useParams } from "react-router-dom";
import FileUploader from "./FileUploader";
import { getFile } from "../../api/FileApi";
import { editUserProfilePicture } from "../../api/UserApi";
import { FaTimes } from "react-icons/fa";

Modal.setAppElement("#root");

interface ProfilePicturePreviewProps {
    profilePicture?: string;
    username: string;
    textSize: string;
    className?: string; // Added for external styling (e.g., from parent components)
}

export default function ProfilePicturePreview({ profilePicture, username, textSize, className }: ProfilePicturePreviewProps) {
    const [imageSrc, setImageSrc] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [previewSrc, setPreviewSrc] = useState<string>("");
    const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
    const [allowedToEdit, setAllowedToEdit] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { sessionType } = useParams();

    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                if (profilePicture) {

                    const response = await getFile(profilePicture);
                    setImageSrc(response.file);
                }
            } catch (err) {
                console.error("Error fetching profile picture:", err);
            }
        };

        fetchProfilePicture();
    }, [profilePicture]);

    useEffect(() => {
        setAllowedToEdit(sessionType === "setting");
    }, [sessionType]);

    const resetEditingState = () => {
        setIsEditing(false);
        setPreviewSrc("");
        setNewProfilePicture(null);
    };

    const openModal = () => setIsModalOpen(allowedToEdit);

    const closeModal = () => {
        resetEditingState();
        setIsModalOpen(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewProfilePicture(file);
            setPreviewSrc(URL.createObjectURL(file));
        }
    };

    const handleSaveClick = async () => {
        if (newProfilePicture) {
            try {
                setIsSubmitting(true);
                const uploadedFileName = await FileUploader({ fileToSend: newProfilePicture });
                if (uploadedFileName) {
                    await editUserProfilePicture(uploadedFileName);
                    setImageSrc(previewSrc);
                }
            } catch (err) {
                console.error("Error uploading profile picture:", err);
            } finally {
                resetEditingState();
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className={`w-full h-full relative group ${className}`}>
            {/* Profile Picture or Initial */}
            {!imageSrc ? (
                <div
                    onClick={openModal}
                    className="w-full h-full rounded-full cursor-pointer flex items-center justify-center bg-gray-800/90 shadow-md transition-all duration-200 hover:bg-gray-700/90"
                >
                    <span className={`font-extrabold text-gray-200 ${textSize}`}>
                        {username.slice(0, 1).toUpperCase()}
                    </span>
                </div>
            ) : (
                <img
                    src={imageSrc}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full cursor-pointer shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
                    onClick={openModal}
                />
            )}
            {allowedToEdit && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Profile Picture Preview"
                className="fixed inset-0 flex items-center justify-center p-6 bg-black/90"
                overlayClassName="fixed inset-0 bg-black/50"
            >
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 p-2 bg-gray-900/80 rounded-full text-gray-200 hover:bg-gray-800 hover:text-white transition-all duration-200 shadow-md"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center justify-center gap-6 bg-gray-900/95 rounded-xl p-6 shadow-xl max-w-md w-full">
                    {/* Modal Content */}
                    {!imageSrc && !previewSrc ? (
                        <div
                            className="w-64 h-64 rounded-lg bg-gray-800/90 flex items-center justify-center shadow-md"
                        >
                            <span className="font-extrabold text-gray-200 text-7xl">
                                {username.slice(0, 1).toUpperCase()}
                            </span>
                        </div>
                    ) : (
                        <img
                            src={previewSrc || imageSrc}
                            alt="Profile Large"
                            className="w-64 h-64 object-cover rounded-lg shadow-md"
                        />
                    )}

                    {/* Edit Controls */}
                    {allowedToEdit && (
                        !isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
                            >
                                Edit
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-4 w-full">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file-input w-full bg-gray-800/80 text-gray-200 border-gray-700 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleSaveClick}
                                        disabled={isSubmitting}
                                        className={`btn px-4 py-2 bg-green-600 text-white rounded-lg shadow-md transition-all duration-200 ${isSubmitting ? "cursor-not-allowed opacity-50" : "hover:bg-green-700"}`}
                                    >
                                        {isSubmitting ? (
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                                            </svg>
                                        ) : (
                                            "Save"
                                        )}
                                    </button>
                                    <button
                                        onClick={resetEditingState}
                                        className="btn px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </Modal>
        </div>
    );
}