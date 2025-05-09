import { useEffect, useState } from "react";
import { getFile } from "../../api/FileApi";
import Modal from "react-modal";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";

Modal.setAppElement("#root");

interface FilePreviewData {
    file: string;
    type: string;
}

interface FilePreviewProps {
    files: string; // Comma-separated file names
    mediaType: {
        isDesktop: boolean;
        isTablet: boolean;
        isMobile: boolean;
    };
}

export default function FilePreview({ files }: FilePreviewProps) {
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
                        const response = await getFile( file);
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
    }, [files]);

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
        const baseClasses = "w-full h-full object-cover rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105";

        if (type.startsWith("image/")) {
            return (
                <img
                    key={index}
                    src={file}
                    alt={`file-${index}`}
                    className={`${baseClasses} bg-gray-900/80`}
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
                    className={`${baseClasses} bg-gray-900/80`}
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
                    className="w-full h-10 bg-gray-900/80 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={(e) => e.stopPropagation()} // Prevent modal open on controls click
                />
            );
        }

        return (
            <div
                key={index}
                className="bg-gray-900/80 rounded-lg flex items-center justify-center w-full h-full text-gray-300 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => openModal(index)}
            >
                Unsupported file type
            </div>
        );
    };

    const renderFileList = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center w-full h-full">
                    <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                    </svg>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center w-full h-full text-gray-300 text-sm font-medium">
                    File not found
                </div>
            );
        }

        const fileCount = filePreviews.length;

        if (fileCount === 1) {
            return <div className="w-full h-full">{renderFilePreview(filePreviews[0].file, filePreviews[0].type, 0)}</div>;
        }

        if (fileCount === 2) {
            return (
                <div className="grid grid-cols-2 gap-2">
                    {filePreviews.map((preview, index) => renderFilePreview(preview.file, preview.type, index))}
                </div>
            );
        }

        if (fileCount === 3) {
            return (
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">{renderFilePreview(filePreviews[0].file, filePreviews[0].type, 0)}</div>
                    {filePreviews.slice(1).map((preview, index) => renderFilePreview(preview.file, preview.type, index + 1))}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 gap-2 relative w-full">
                {filePreviews.slice(0, 3).map((preview, index) => renderFilePreview(preview.file, preview.type, index))}
                {filePreviews.length > 3 && (
                    <div className="relative">
                        {renderFilePreview(filePreviews[3].file, filePreviews[3].type, 3)}
                        <div
                            onClick={() => openModal(3)}
                            className="absolute inset-0 bg-gray-800/70 flex items-center justify-center text-gray-200 text-lg font-bold rounded-lg cursor-pointer hover:bg-gray-800/90 transition-all duration-200"
                        >
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
            return <div className="text-gray-200 text-lg font-medium">No file available</div>;
        }

        const { file, type } = currentFile;
        if (type.startsWith("image/")) {
            return <img src={file} alt={`file-${currentIndex}`} className="max-w-full max-h-full object-contain rounded-lg" />;
        }
        if (type.startsWith("video/")) {
            return <video src={file} controls className="max-w-full max-h-full object-contain rounded-lg" />;
        }
        if (type.startsWith("audio/")) {
            return <audio src={file} controls className="w-full h-12 bg-gray-900/80 rounded-full shadow-md" />;
        }
        return <div className="text-gray-200 text-lg font-medium">Unsupported file type</div>;
    };

    return (
        <div className="bg-transparent w-full h-full flex items-center justify-center">
            <div className="w-full h-full">{renderFileList()}</div>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="File Preview"
                className="fixed inset-0 flex items-center justify-center p-4 bg-black/90"
                overlayClassName="fixed inset-0 bg-black/50"
            >
                {/* Modal Controls */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 p-2 bg-gray-900/80 rounded-full text-gray-200 hover:bg-gray-800 hover:text-white transition-all duration-200 shadow-md"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
                {filePreviews.length > 1 && (
                    <>
                        <button
                            onClick={() => navigateModal("prev")}
                            className="absolute top-1/2 left-4 transform -translate-y-1/2 p-2 bg-gray-900/80 rounded-full text-gray-200 hover:bg-gray-800 hover:text-white transition-all duration-200 shadow-md"
                        >
                            <FaArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigateModal("next")}
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 bg-gray-900/80 rounded-full text-gray-200 hover:bg-gray-800 hover:text-white transition-all duration-200 shadow-md"
                        >
                            <FaArrowRight className="w-5 h-5" />
                        </button>
                    </>
                )}
                {/* Modal Content */}
                <div className="flex items-center justify-center w-full h-full p-6">
                    <div className="bg-gray-900/80 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {renderModalContent()}
                    </div>
                </div>
            </Modal>
        </div>
    );
}