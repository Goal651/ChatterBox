import axios from 'axios';
import { serverUrl } from '../../constants/constant';

interface FileUploaderProps {
    fileToSend?: File | null;
}

export default async function FileUploader({ fileToSend}: FileUploaderProps): Promise<string> {
    const accessToken = localStorage.getItem('token');

    const MAX_RETRIES = 3;

    const uploadChunk = async (currentChunk = 0, retryCount = 0): Promise<string> => {
        if (!fileToSend) return '';
        const chunkSize = 1 * 1024 * 1024; // 1MB chunk size
        const totalChunks = Math.ceil(fileToSend.size / chunkSize);
        const from = currentChunk * chunkSize;
        const to = Math.min(from + chunkSize, fileToSend.size);
        const blob = fileToSend.slice(from, to);

        try {
            const formData = new FormData();
            formData.append('file', blob);

            const response = await axios.post(`${serverUrl}/uploadFile`, blob, {
                headers: {
                    accesstoken: accessToken,
                    name: encodeURIComponent(fileToSend.name),
                    type: fileToSend.type,
                    currentChunk,
                    totalChunks,
                    typeFolder: 'messages',
                    'Content-Type': 'multipart/form-data',
                },
            });
            const result = response.data as { finalFileName: string, uploadComplete?: boolean }

            if (currentChunk + 1 < totalChunks) uploadChunk(currentChunk + 1);
            if (result.uploadComplete) return result.finalFileName
        } catch {
            if (retryCount < MAX_RETRIES) {
                console.warn(`Retrying chunk ${currentChunk}, attempt ${retryCount + 1}`);
                uploadChunk(currentChunk, retryCount + 1);
            } else {
                console.error(`Failed chunk ${currentChunk} after ${MAX_RETRIES} retries.`);
                return ''
            }
        }
        return ''
    };

    if (!fileToSend) return '';
    const finalFileName = await uploadChunk(0);

    return finalFileName
};

