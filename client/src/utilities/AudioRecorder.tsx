import { useState, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import RecordRTC from "recordrtc";
import AudioWave from "../components/AudioWave";

interface AudioRecorderProps {
    onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void;
}

interface RecordedMediaType{
    audioBlob: Blob;
    audioUrl: string;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps): JSX.Element {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const recorderRef = useRef<RecordRTC | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null); // Ref to store the media stream
    const [recodedMedia,setRecordedMedia] = useState<RecordedMediaType | null>(null);

    const startRecording = (): void => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                mediaStreamRef.current = stream; // Save the media stream
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
                    onRecordingComplete(blob, url);
                    setRecordedMedia({ audioBlob: blob, audioUrl: url });
                }
                recorderRef.current = null; 
            });
        }

        // Stop all tracks of the media stream
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            mediaStreamRef.current = null; 
        }

        setIsRecording(false);
    };
    if (recodedMedia?.audioBlob) {
        return (
            <div className="">
                <AudioWave audio={recodedMedia.audioBlob} />
            </div>
        )
    }

    return (
        <div className="flex space-x-4">
            {!isRecording ? (
                <button onClick={startRecording}>
                    <FaMicrophone className="text-xl text-black" />
                </button>
            ) : (
                <button onClick={stopRecording}>
                    <FaMicrophone className="text-xl text-red-900" />

                </button>
            )}
        </div>
    );
}
