import { FaCamera, FaLink, FaPaperPlane } from "react-icons/fa";
import { FaFaceLaugh } from "react-icons/fa6";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useEffect, useRef, useState } from "react";
import FileMessagePreview from "../utilities/FileMessagePreview";
import { GroupMessage, Message, SenderProps, User } from "../interfaces/interfaces";
import FileUploader from "../utilities/FileUploader";
import AudioRecorder from "../utilities/AudioRecorder";
import StyledAudioPlayer from "../utilities/StyledAudioPlayer";
import { useParams } from "react-router-dom";
import PhotoCapture from "../utilities/PhotoCapture";

export default function Sender({ socket, sentMessage, serverUrl, sentGroupMessage, messageInEdition }: SenderProps) {
    const user = sessionStorage.getItem('currentUser') || '';
    const selectedUser = sessionStorage.getItem('selectedUser') || '';
    const currentUser: User = user ? JSON.parse(user) : null;
    const friend: User = selectedUser ? JSON.parse(selectedUser) : null;
    const [message, setMessage] = useState('');
    const [editingMode, setEditingMode] = useState(false);
    const [fileData, setFileData] = useState<File[] | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const pickerRef = useRef<HTMLDivElement | null>(null);

    const { componentId, sessionType } = useParams();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (messageInEdition) {
            setMessage(messageInEdition.message);
            setEditingMode(true);
        }
    }, [messageInEdition]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setMessage(value);
        if (socket) socket.emit(value ? "userTyping" : "userNotTyping", { receiverId: friend._id });
    };

    const resetSenderComponent = () => {
        setMessage('');
        setFileData(null);
        setShowEmojiPicker(false);
        setRecordedAudio(null);
        setRecordedAudioUrl(null);
        // Signal AudioRecorder to reset
        // if (resetRecording) resetRecording();
    };

    useEffect(() => resetSenderComponent(), [componentId]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!files) return;
        setFileData((prev) => (prev ? [...prev, ...Array.from(files)] : Array.from(files)));
        if (socket) socket.emit("userTyping", { receiverId: friend._id });
    };

    const handleCapturedPhoto = (data: File) => {
        setFileData((prev) => (prev ? [...prev, data] : [data]));
        setIsTakingPhoto(false);
    };

    const cancelFile = (fileName: string) => {
        setFileData((prev) => (prev?.filter((file) => file.name !== fileName)) ?? null);
    };

    const handleEmojiSelect = (data: { native: string }) => {
        setMessage((prev) => (prev + data.native));
        if (socket) socket.emit("userTyping", { receiverId: friend._id });
    };

    const handleFileUploads = async (): Promise<string[]> => {
        setIsUploading(true);
        if (!fileData || fileData.length <= 0) {
            setIsUploading(false);
            return [];
        }
        const result = await Promise.all(fileData.map(async (file) => {
            const data = await FileUploader({ fileToSend: file, serverUrl });
            return data;
        }));
        setIsUploading(false);
        return result;
    };

    const uploadRecordedAudio = async () => {
        setIsUploading(true);
        if (!recordedAudio) {
            setIsUploading(false);
            return '';
        }
        const fileName = `recording_${Date.now()}.mp3`;
        const audioFile = new File([recordedAudio], fileName, { type: recordedAudio.type });
        const audio = await FileUploader({ fileToSend: audioFile, serverUrl });
        setIsUploading(false);
        return audio ? audio : '';
    };
    

    const handleVoiceRecorded = (data: Blob) => {
        setRecordedAudio(data);
        setRecordedAudioUrl(URL.createObjectURL(data));
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!componentId) return;
        if (!message && !fileData && !recordedAudio) return;
        if (!friend || !currentUser) return;
        const result = await handleFileUploads();
        const audioResult: string = await uploadRecordedAudio();
        const userMessage: Message = {
            _id: Date.now(),
            sender: currentUser._id,
            receiver: friend._id,
            message: result.length > 0 || audioResult ? result.length > 0 ? result.toString() : audioResult : message,
            isMessageSeen: false,
            edited: false,
            isMessageSent: false,
            isMessageReceived: false,
            reactions: [],
            replying: null,
            type: result.length > 0 || audioResult ? 'file' : 'text',
            createdAt: new Date()
        };

        const groupMessage: GroupMessage = {
            _id: Date.now(),
            sender: currentUser,
            group: componentId,
            message: result.length > 0 || audioResult ? result.length > 0 ? result.toString() : audioResult : message,
            isMessageSent: false,
            edited: false,
            seen: [],
            reactions: [],
            replying: null,
            type: result.length > 0 || audioResult ? 'file' : 'text',
            createdAt: new Date()
        };

        if (sessionType === 'chat') {
            if (editingMode) {
                socket.emit('editMessage', { message: userMessage, messageId: messageInEdition?._id, receiver: messageInEdition?.receiver });
            } else {
                socket.emit("message", { message: userMessage.message, receiverId: friend._id, messageType: userMessage.type, messageId: userMessage._id });
                sentMessage({ message: userMessage });
            }
        } else {
            socket.emit("groupMessage", { message: groupMessage.message, group: groupMessage.group, messageType: groupMessage.type, messageId: groupMessage._id, sender: currentUser });
            sentGroupMessage({ message: groupMessage });
        }
        resetSenderComponent();
        socket.emit('userNotTyping', { receiverId: friend._id });
    };

    return (
        <div className="flex w-full gap-4 items-center justify-center px-4 py-2 bg-gray-900/95 rounded-xl shadow-md">
            {isTakingPhoto && <PhotoCapture onPhotoCapture={handleCapturedPhoto} />}

            {/* Audio Recording State */}
            {recordedAudio ? (
                <div className="flex w-full items-center gap-4 bg-gray-800/90 p-4 rounded-lg shadow-inner">
                    <StyledAudioPlayer url={recordedAudioUrl || ''} />
                    <button
                        className="btn px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md"
                        onClick={() => setRecordedAudio(null)}
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex w-full flex-col gap-3">
                    {/* Input and Controls */}
                    <form onSubmit={sendMessage} className="flex items-center gap-3 bg-gray-900/80 p-3 rounded-lg shadow-inner">
                        <label className="cursor-pointer hover:text-blue-400 transition-colors duration-200" htmlFor="fileInput">
                            <FaLink className="text-gray-300 w-5 h-5" />
                        </label>
                        <input
                            type="file"
                            id="fileInput"
                            onChange={handleFileInputChange}
                            className="hidden"
                            multiple
                        />
                        <input
                            type="text"
                            placeholder="Type a message..."
                            onChange={handleChange}
                            value={message}
                            className="flex-1 px-4 py-2 bg-gray-800/80 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        />
                        <div className="flex gap-3">
                            <FaFaceLaugh
                                className="text-gray-300 w-6 h-6 cursor-pointer hover:text-blue-400 transition-colors duration-200"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            />
                            <FaCamera
                                onClick={() => setIsTakingPhoto(true)}
                                className="text-gray-300 w-6 h-6 cursor-pointer hover:text-blue-400 transition-colors duration-200"
                            />
                        </div>
                    </form>

                    {/* File Previews */}
                    {fileData && fileData.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                            {fileData.map((file, index) => (
                                <FileMessagePreview
                                    key={index}
                                    data={file}
                                    cancelFile={cancelFile}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Send Button / Audio Recorder */}
            <div className="flex-shrink-0">
                {isUploading ? (
                    <button className="btn p-3 bg-blue-600 text-white rounded-lg cursor-not-allowed flex items-center justify-center shadow-md">
                        <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                        </svg>
                    </button>
                ) : message || fileData || recordedAudio ? (
                    <button
                        type="submit"
                        onClick={sendMessage}
                        className="btn p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center justify-center"
                    >
                        <FaPaperPlane className="w-6 h-6" />
                    </button>
                ) : (
                    <div className="btn p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center justify-center">

                        <AudioRecorder onRecordingComplete={handleVoiceRecorded} resetRecording={resetSenderComponent} />
                    </div>
                )}
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div
                    ref={pickerRef}
                    className="absolute bottom-20 z-50 w-80 max-w-full bg-gray-900/95 rounded-lg shadow-xl border border-gray-700"
                >
                    <Picker
                        data={data}
                        theme="dark"
                        onEmojiSelect={handleEmojiSelect}
                        width="100%"
                    />
                </div>
            )}
        </div>
    );
}