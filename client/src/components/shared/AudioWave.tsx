import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaTrash } from "react-icons/fa";

interface AudioWaveProps {
    audio: Blob;
    audioUrl: string;
}

export default function AudioWave({ audio, audioUrl }: AudioWaveProps): JSX.Element {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const audioElement = new Audio(audioUrl);
        audioRef.current = audioElement;

        audioElement.addEventListener("loadedmetadata", () => {
            setDuration(audioElement.duration);
        });

        audioElement.addEventListener("timeupdate", () => {
            setCurrentTime(audioElement.currentTime);
        });

        audioElement.addEventListener("ended", () => {
            setIsPlaying(false);
            setCurrentTime(0);
        });

        // Waveform visualization
        const visualize = async () => {
            const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const arrayBuffer = await audio.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const rawData = audioBuffer.getChannelData(0); // Mono channel
            const samples = 100; // Number of bars
            const blockSize = Math.floor(rawData.length / samples);
            const filteredData: number[] = [];

            for (let i = 0; i < samples; i++) {
                const blockStart = blockSize * i;
                let sum = 0;
                for (let j = 0; j < blockSize; j++) {
                    sum += Math.abs(rawData[blockStart + j]);
                }
                filteredData.push(sum / blockSize);
            }

            const multiplier = Math.pow(Math.max(...filteredData), -1);
            const normalizedData = filteredData.map(n => n * multiplier);

            drawWaveform(normalizedData);
        };

        visualize();

        return () => {
            audioElement.pause();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [audio, audioUrl]);

    const drawWaveform = (data: number[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const barWidth = width / data.length;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#1f2937"; // bg-gray-900
        ctx.fillRect(0, 0, width, height);

        data.forEach((value, index) => {
            const barHeight = value * height * 0.8;
            const x = barWidth * index;
            const y = (height - barHeight) / 2;

            ctx.fillStyle = isPlaying && currentTime > (index / data.length) * duration ? "#3b82f6" : "#60a5fa"; // blue-600 or blue-400
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });

        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(() => drawWaveform(data));
        }
    };

    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="w-full bg-gray-900/80 rounded-lg p-3 shadow-md flex items-center gap-3">
            <button
                onClick={togglePlayPause}
                className="p-2 bg-blue-600 rounded-full shadow-md hover:bg-blue-700 transition-all duration-200"
            >
                {isPlaying ? (
                    <FaPause className="w-5 h-5 text-white" />
                ) : (
                    <FaPlay className="w-5 h-5 text-white" />
                )}
            </button>
            <div className="flex-1 flex items-center gap-2">
                <span className="text-gray-200 text-sm font-medium">{formatTime(currentTime)}</span>
                <canvas ref={canvasRef} className="w-full h-16" />
                <span className="text-gray-200 text-sm font-medium">{formatTime(duration)}</span>
            </div>
            <button
                className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700 transition-all duration-200"
            >
                <FaTrash className="w-5 h-5 text-white" />
            </button>
        </div>
    );
}