import { useEffect, useState } from "react";
import { getFile } from "../api/api";
import Modal from "react-modal"

Modal.setAppElement("#root");

interface FilePreviewData {
    file: string;
    type: string;
};

interface FilePreviewProps {
    files: string; // Comma-separated file names
    serverUrl: string;
    mediaType: {
        isDesktop: boolean
        isTablet: boolean
        isMobile: boolean
    }
}

export default function FilePreview({ files, serverUrl, mediaType }: FilePreviewProps) {
    const [filePreviews, setFilePreviews] = useState<FilePreviewData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const fileList = files.includes(",") ? files.split(",").map((file) => file.trim()) : [files];
                const fetchedFiles = await Promise.all(
                    fileList.map(async (file) => {
                        const response = await getFile(serverUrl, file);
                        return { file: response.file as string, type: response.fileType as string };
                    })
                );
                setFilePreviews(fetchedFiles);
            } catch (err) {
                console.error("Error fetching files:", err);
                setError("Failed to fetch files.");
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, [files, serverUrl]);

    const openModal = (index: number) => {
        setCurrentIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const navigateModal = (direction: "next" | "prev") => {
        setCurrentIndex((prevIndex) => {
            if (direction === "next") {
                return (prevIndex + 1) % filePreviews.length;
            } else {
                return (prevIndex - 1 + filePreviews.length) % filePreviews.length;
            }
        });
    };

    const renderFilePreview = (file: string, type: string, index: number) => {
        if (type.startsWith("image/")) {
            return (
                <img
                    key={index}
                    src={file}
                    alt={`file-${index}`}
                    className="w-full h-full object-cover rounded-lg cursor-pointer bg-black"
                    onClick={() => openModal(index)}
                />
            );
        }
        if (type.startsWith("video/")) {
            return (
                <video
                    key={index}
                    src={file}
                    controls
                    className="w-full h-full rounded-md cursor-pointer"
                    onClick={() => openModal(index)}
                />
            );
        }
        if (type.startsWith("audio/")) {
            return (
                <audio
                    key={index}
                    src={file}
                    controls
                    className={`h-10 cursor-pointer ${mediaType.isMobile ? "w-60" : "w-80"} w-full`}
                    onClick={() => openModal(index)}
                />
            );
        }

        return (
            <div
                key={index}
                className="bg-black rounded-lg flex items-center justify-center w-full h-full text-white text-sm cursor-pointer"
                onClick={() => openModal(index)}
            >
                Unsupported file type
            </div>
        );
    };

    const renderFileList = () => {
        if (loading) {
            return <div className="text-gray-500 loading-spinner" />;
        }

        if (error) {
            return <div className="min-w-full h-full  ">File not found</div>;
        }

        const fileCount = filePreviews.length;

        if (fileCount === 1) {
            return <div className="w-full h-full">{renderFilePreview(filePreviews[0].file, filePreviews[0].type, 0)}</div>;
        }

        if (fileCount === 2) {
            return (
                <div className=" grid grid-cols-2 gap-2">
                    {filePreviews.map((preview, index) => renderFilePreview(preview.file, preview.type, index))}
                </div>
            );
        }

        if (fileCount === 3) {
            return (
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative col-span-2">
                        {renderFilePreview(filePreviews[0].file, filePreviews[0].type, 0)}
                    </div>
                    {filePreviews.slice(1).map((preview, index) => renderFilePreview(preview.file, preview.type, index + 1))}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 gap-4 relative w-full">
                {filePreviews.slice(0, 3).map((preview, index) => renderFilePreview(preview.file, preview.type, index))}
                {filePreviews.length > 3 && (
                    <div className="relative">
                        {renderFilePreview(filePreviews[3].file, filePreviews[3].type, 3)}
                        <div
                            onClick={() => openModal(3)}
                            className="absolute inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center text-white text-xl font-bold rounded-md cursor-pointer">
                            +{filePreviews.length - 4} more
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderModalContent = () => {
        const currentFile = filePreviews[currentIndex];
        if (!currentFile) {
            return <div className="text-white">No file available</div>;
        }

        const { file, type } = currentFile;
        if (type.startsWith("image/")) {
            return <img src={file} alt={`file-${currentIndex}`} className="w-full h-full object-cover rounded-lg" />;
        }
        if (type.startsWith("video/")) {
            return <video src={file} controls className="w-full h-full object-cover rounded-md" />;
        }
        if (type.startsWith("audio/")) {
            return <audio src={file} controls className="w-full h-full object-cover rounded-md" />;
        }
        return <div className="text-white">Unsupported file type</div>;
    };


    return (
        <div className="bg-transparent w-full h-full flex items-center justify-center ">
            <div className="w-full h-full">
                {renderFileList()}
            </div>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="File Preview"
                className="fixed top-0 left-0  h-screen w-screen bg-opacity-90 bg-black overflow-hidden"
                overlayClassName="modal-overlay"
            >
                <button onClick={closeModal} className="text-white absolute top-4 right-4">Close</button>
                <button
                    onClick={() => navigateModal("prev")}
                    className="text-white absolute top-1/2 left-4 transform -translate-y-1/2"
                >
                    Previous
                </button>
                <button
                    onClick={() => navigateModal("next")}
                    className="text-white absolute top-1/2 right-4 transform -translate-y-1/2"
                >
                    Next
                </button>
                <div className="flex w-full h-full  items-center justify-center p-10">
                    <div className="bg-black rounded-lg w-1/3">
                        {renderModalContent()}
                    </div>
                </div>
            </Modal>
        </div>
    );
}