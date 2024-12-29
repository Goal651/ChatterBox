import { useEffect, useState } from "react";

interface FileMessagePreviewProps {
    key:number
    data: File;
    cancelFile: (fileName:string) => void;
}

export default function FileMessagePreview({ data, cancelFile }: FileMessagePreviewProps) {
    const [filePreview, setFilePreview] = useState<string>("");

    const handleCancelFile  = () => {
        cancelFile(data.name);
        setFilePreview("");
    }

    useEffect(() => {
        if (data) {
            const preview = URL.createObjectURL(data);
            setFilePreview(preview);

            // Cleanup the object URL when the component unmounts
            return () => URL.revokeObjectURL(preview);
        }
    }, [data]);

    return (
        <div className="relative rounded-box w-12 h-12">
            <button 
                className="absolute -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full text-center"
                onClick={handleCancelFile}
            >
                🗙
            </button>
            {filePreview && (
                <div className="flex items-center justify-center w-full h-full">
                    <img
                        src={filePreview}
                        alt="File Preview"
                        className="w-full h-full object-cover rounded"
                    />
                </div>
            )}
        </div>
    );
}
