import { useEffect, useState } from "react";
import Modal from "react-modal";


Modal.setAppElement("#root");

interface ProfilePicturePreviewProps {
    profilePicture?: string;
    username: string;
    textSize: string;
}

export default function ProfilePicturePreview({ profilePicture, username, textSize,  }: ProfilePicturePreviewProps) {
    const [imageSrc, setImageSrc] = useState<string>("");


    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                if (profilePicture) {

                  
                    setImageSrc('');
                }
            } catch (err) {
                console.error("Error fetching profile picture:", err);
            }
        };

        fetchProfilePicture();
    }, [profilePicture]);



    return (
        <div className={``}>
            {!imageSrc ? (
                <div
                    className="w-full h-full rounded-full cursor-pointer flex items-center justify-center"
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
                />
            )}


        </div>
    );
}