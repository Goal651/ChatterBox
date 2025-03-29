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
    };

    useEffect(() => resetSenderComponent, [componentId]);

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
        const fileName = `recording_${Date.now()}.mp3`; // Generate a unique name for the file
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
        <div className="flex w-full gap-2 items-center justify-center">
            {isTakingPhoto && <PhotoCapture onPhotoCapture={handleCapturedPhoto} />}
            {recordedAudio ? (
                <div className="bg-slate-700 w-full p-4 rounded-lg space-y-4 flex space-x-4">
                    <StyledAudioPlayer url={recordedAudioUrl || ''} />
                    <button className="btn btn-error text-white w-14" onClick={() => setRecordedAudio(null)}>cancel</button>
                </div>
            ) : (
                <div className="bg-slate-800 w-4/6 sm:w-5/6 lg:w-full p-4 rounded-lg space-y-4">
                    <form onSubmit={sendMessage} className="flex space-x-4 bg-slate-800 items-center">
                        <div>
                            <label className="cursor-pointer" htmlFor="fileInput">
                                <FaLink className="text-white w-4 h-4" />
                            </label>
                            <input
                                type='file'
                                id="fileInput"
                                onChange={handleFileInputChange}
                                className="hidden"
                                multiple
                            />
                        </div>
                        <input
                            type='text'
                            placeholder="message..."
                            onChange={handleChange}
                            value={message}
                            className="input input-ghost focus:bg-slate-800 w-full placeholder:text-gray-400 outline-0 text-white focus:outline-none"
                        />
                        <div className="flex space-x-4">
                            <FaFaceLaugh
                                className="text-white cursor-pointer"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            />
                            <FaCamera
                                onClick={() => setIsTakingPhoto(true)}
                                className="text-white"
                            />
                        </div>
                    </form>
                    <div className="flex space-x-4 w-40 md:w-96 overflow-x-auto">
                        {fileData && fileData.length > 0 && (
                            fileData.map((file, index) => (
                                <FileMessagePreview
                                    key={index}
                                    data={file}
                                    cancelFile={cancelFile}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
            <div className="flex items-center w-1/6 md:w-fit">
                {isUploading ? (
                    <button className="btn bg-blue-500 border-0 flex items-center">
                        <div className="text-xl text-black loading loading-spinner" />
                    </button>
                ) : (message || fileData || recordedAudio ? (
                    <button className="btn bg-blue-500 border-0 flex items-center py-10 px-auto">
                        <FaPaperPlane className="text-xl text-black" />
                    </button>
                ) : (
                    <div className="btn bg-blue-500 border-0 flex items-center py-10 px-auto">
                        <AudioRecorder onRecordingComplete={handleVoiceRecorded} />
                    </div>
                ))}
            </div>
            {showEmojiPicker && (
                <div
                    ref={pickerRef}
                    className="absolute bottom-16 z-50 w-fit sm:w-96 overflow-x-auto shadow-lg"
                >
                    <Picker
                        data={data}
                        theme={'dark'}
                        onEmojiSelect={handleEmojiSelect}
                        width="100%"
                    />
                </div>
            )}
        </div>
    );
}