import { useRef, useState } from "react";
import { FaCamera, FaRedoAlt, FaCheck } from "react-icons/fa";

interface PhotoCaptureProps {
    onPhotoCapture: (photoFile: File) => void;
}

export default function PhotoCapture({ onPhotoCapture }: PhotoCaptureProps): JSX.Element {
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
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png");
                setPhotoDataUrl(dataUrl);
                setPhotoTaken(true);
            }
        }
        stopCamera();
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
        }
    };

    const dataURLToFile = (dataUrl: string, filename: string): File => {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    return (
        <div className="fixed top-0 left-0 flex flex-col items-center space-y-4 bg-gray-800 p-4 rounded-lg h-screen w-screen bg-opacity-80">
            <div className="relative w-full max-w-5xl h-auto bg-black rounded-lg overflow-hidden">
                {!photoTaken ? (
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                    ></video>
                ) : (
                    <img
                        src={photoDataUrl || ""}
                        alt="Captured"
                        className="w-full h-full object-cover"
                    />
                )}
                <canvas ref={canvasRef} className="hidden" width={640} height={480}></canvas>
            </div>

            <div className="flex space-x-4">
                {!photoTaken ? (
                    <button
                        onClick={isCapturing ? capturePhoto : startCamera}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                    >
                        <FaCamera />
                        <span>{isCapturing ? "Capture" : "Start Camera"}</span>
                    </button>
                ) : (
                    <>
                        <button
                            onClick={retakePhoto}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-yellow-600"
                        >
                            <FaRedoAlt />
                            <span>Retake</span>
                        </button>
                        <button
                            onClick={savePhoto}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
                        >
                            <FaCheck />
                            <span>Save</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
