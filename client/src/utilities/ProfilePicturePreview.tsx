import { useEffect, useState } from "react";
import { getFile } from "../api/api";
import Modal from "react-modal";

Modal.setAppElement("#root");

interface ProfilePicturePreviewProps {
    profilePicture: string; // Profile picture file name
    serverUrl: string;
}

export default function ProfilePicturePreview({ profilePicture, serverUrl }: ProfilePicturePreviewProps) {
    const [imageSrc, setImageSrc] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const response = await getFile(serverUrl, profilePicture);
                setImageSrc(response.file);
            } catch (err) {
                console.error("Error fetching profile picture:", err);
                setError("Failed to load profile picture.");
            } finally {
                setLoading(false);
            }
        };
        if (profilePicture === '') {
            setImageSrc("/image.png");
            setLoading(false);
            return
        }

        fetchProfilePicture();
    }, [profilePicture, serverUrl]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="w-full h-full">
            {loading ? (
                <div
                    className="text-gray-500 loading-spinner">
                    Loading...
                </div>
            ) : error ? (
                <div
                    className="text-red-500">
                    {error}
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
                <div className="flex items-center justify-center">
                    <img src={imageSrc} alt="Profile Large" className="w-auto max-w-full max-h-full rounded-lg" />
                </div>
            </Modal>
        </div>
    );
}
