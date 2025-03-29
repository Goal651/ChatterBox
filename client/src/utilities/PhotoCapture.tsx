import { useState, useRef } from "react";
import { FaCamera, FaRedoAlt, FaCheck, FaTimes } from "react-icons/fa";

interface PhotoCaptureProps {
    onPhotoCapture: (photoFile: File) => void;
    onClose?: () => void; // Optional prop to close the component
}

export default function PhotoCapture({ onPhotoCapture, onClose }: PhotoCaptureProps): JSX.Element {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isCapturing, setIsCapturing] = useState<boolean>(false);
    const [photoTaken, setPhotoTaken] = useState<boolean>(false);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

    const startCamera = async (): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsCapturing(true);
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    const stopCamera = (): void => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCapturing(false);
    };

    const capturePhoto = (): void => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            if (context) {
                // Set canvas size to match video feed
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png");
                setPhotoDataUrl(dataUrl);
                setPhotoTaken(true);
                stopCamera();
            }
        }
    };

    const retakePhoto = (): void => {
        setPhotoTaken(false);
        setPhotoDataUrl(null);
        startCamera();
    };

    const savePhoto = (): void => {
        if (photoDataUrl) {
            const file = dataURLToFile(photoDataUrl, "photo.png");
            onPhotoCapture(file);
            if (onClose) onClose(); // Close the component after saving
        }
    };

    const dataURLToFile = (dataUrl: string, filename: string): File => {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleClose = () => {
        stopCamera();
        setPhotoTaken(false);
        setPhotoDataUrl(null);
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/90 p-6 z-50">
            {/* Close Button */}
            <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-gray-900/80 rounded-full text-gray-200 hover:bg-gray-800 hover:text-white transition-all duration-200 shadow-md"
            >
                <FaTimes className="w-5 h-5" />
            </button>

            {/* Video/Photo Display */}
            <div className="relative w-full max-w-3xl h-[70vh] bg-gray-950 rounded-xl overflow-hidden shadow-xl">
                {!photoTaken ? (
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                    />
                ) : (
                    <img
                        src={photoDataUrl || ""}
                        alt="Captured"
                        className="w-full h-full object-contain"
                    />
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-6">
                {!photoTaken ? (
                    <button
                        onClick={isCapturing ? capturePhoto : startCamera}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
                    >
                        <FaCamera className="w-5 h-5" />
                        <span>{isCapturing ? "Capture" : "Start Camera"}</span>
                    </button>
                ) : (
                    <>
                        <button
                            onClick={retakePhoto}
                            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition-all duration-200"
                        >
                            <FaRedoAlt className="w-5 h-5" />
                            <span>Retake</span>
                        </button>
                        <button
                            onClick={savePhoto}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-200"
                        >
                            <FaCheck className="w-5 h-5" />
                            <span>Save</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}