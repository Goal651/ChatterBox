import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useParams } from "react-router-dom";
import FileUploader from "./FileUploader";
import { Photos } from "../interfaces/interfaces";
import { getFile } from "../api/FileApi";
import { editUserProfilePicture } from "../api/UserApi";

Modal.setAppElement("#root");

interface ProfilePicturePreviewProps {
    profilePicture?: string;
    serverUrl: string;
    loadedImage: (data: Photos) => void
    photos: Photos[]
    username: string
    textSize: string
}

export default function ProfilePicturePreview({ profilePicture, serverUrl, loadedImage, photos, username, textSize }: ProfilePicturePreviewProps) {
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
                    const isPhotoAvailable = photos.filter((photo) => photo.key === profilePicture)[0];
                    if (isPhotoAvailable) {
                        setImageSrc(isPhotoAvailable.photo);
                        return
                    }
                    const response = await getFile(serverUrl, profilePicture);
                    setImageSrc(response.file);
                    const newProfilePic: Photos = {
                        key: profilePicture,
                        photo: response.file
                    }
                    loadedImage(newProfilePic)
                }

            } catch (err) {
                console.error("Error", err);
            }
        };

        fetchProfilePicture();
    }, [profilePicture, serverUrl, photos]);

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
            setPreviewSrc(URL.createObjectURL(file)); // Generate preview URL
        }
    };

    const handleSaveClick = async () => {
        if (newProfilePicture) {
            try {
                setIsSubmitting(true);
                const uploadedFileName = await FileUploader({ fileToSend: newProfilePicture, serverUrl });
                if (uploadedFileName) {
                    await editUserProfilePicture(serverUrl, uploadedFileName);
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
        <div className="w-full h-full ">
            {!imageSrc ? (<div onClick={openModal}
                className={`w-full h-full  rounded-full cursor-pointer flex justify-center items-center bg-slate-800 `}>
                <div className={`font-extrabold  text-slate-200 ${textSize}`}>
                    {username.slice(0, 1).toUpperCase()}
                </div>
            </div>
            ) : (
                <img
                    src={imageSrc}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full cursor-pointer"
                    onClick={openModal}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Profile Picture Preview"
                className="fixed top-0 left-0 h-full w-full bg-opacity-90 bg-black flex items-center justify-center"
                overlayClassName="modal-overlay"
            >
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-900 rounded-full px-3 py-1"
                >
                    Close
                </button>
                <div className="flex flex-col items-center justify-center">

                    {!imageSrc ? (<div onClick={openModal}
                        className={`w-96 h-96 rounded-lg mb-4 bg-slate-800 flex items-center justify-center`}>
                        <div className="font-extrabold text-blue-800 text-9xl">
                            {username.slice(0, 1).toUpperCase()}
                        </div>
                    </div>
                    ) : (
                        <img
                            src={previewSrc || imageSrc}
                            alt="Profile Large"
                            className="w-auto max-w-96 max-h-96 rounded-lg mb-4"
                        />
                    )}

                    {allowedToEdit && (
                        !isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Edit
                            </button>
                        ) : (
                            <div className="flex flex-col items-center space-y-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="border border-gray-300 rounded px-2 py-1"
                                />
                                <div className="flex space-x-4">
                                    {isSubmitting ? (
                                        <button
                                            onClick={handleSaveClick}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                        >
                                            saving...
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSaveClick}
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        >
                                            Save
                                        </button>
                                    )}
                                    <button
                                        onClick={resetEditingState}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </Modal >
        </div >
    );
}
