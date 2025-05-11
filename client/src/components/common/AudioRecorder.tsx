import { useState, useRef, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";
import RecordRTC from "recordrtc";
import AudioWave from "./AudioWave";

interface AudioRecorderProps {
    onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void;
    resetRecording?: () => void; // Optional prop to reset recorded media externally
}

interface RecordedMediaType {
    audioBlob: Blob;
    audioUrl: string;
}

export default function AudioRecorder({ onRecordingComplete, resetRecording }: AudioRecorderProps): JSX.Element {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordedMedia, setRecordedMedia] = useState<RecordedMediaType | null>(null);
    const [recordingTime, setRecordingTime] = useState<number>(0); // Time in seconds
    const recorderRef = useRef<RecordRTC | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer logic
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setRecordingTime(0);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    // Reset recorded media if parent signals it
    useEffect(() => {
        if (resetRecording && recordedMedia) {
            setRecordedMedia(null);
        }
    }, [resetRecording, recordedMedia]);

    const startRecording = (): void => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                mediaStreamRef.current = stream;
                recorderRef.current = new RecordRTC(stream, {
                    type: "audio",
                    mimeType: "audio/wav",
                    recorderType: RecordRTC.StereoAudioRecorder,
                });
                recorderRef.current.startRecording();
                setIsRecording(true);
            })
            .catch((err: Error) => console.error("Error accessing audio devices:", err));
    };

    const stopRecording = (): void => {
        if (recorderRef.current) {
            recorderRef.current.stopRecording(() => {
                const blob = recorderRef.current?.getBlob();
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setRecordedMedia({ audioBlob: blob, audioUrl: url });
                    onRecordingComplete(blob, url);
                }
                recorderRef.current = null;
            });
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            mediaStreamRef.current = null;
        }

        setIsRecording(false);
    };

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (recordedMedia?.audioBlob) {
        return (
            <div className="w-full">
                <AudioWave audio={recordedMedia.audioBlob} audioUrl={recordedMedia.audioUrl} />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-4">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-full shadow-md transition-all duration-200 ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
            >
                <FaMicrophone className={`w-6 h-6 ${isRecording ? "text-white animate-pulse" : "text-white"}`} />
            </button>
            {isRecording && (
                <span className="text-gray-200 text-sm font-medium bg-gray-900/80 px-3 py-1 rounded-full shadow-md">
                    {formatTime(recordingTime)}
                </span>
            )}
        </div>
    );
}