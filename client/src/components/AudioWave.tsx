import { useEffect, useRef,} from "react";

interface AudioWaveProps {
    audio?: Blob
}

const AudioWave = (data: AudioWaveProps) => {
    const waveRefs = useRef<HTMLDivElement[]>([]);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        let analyser: AnalyserNode | null = null;
        let dataArray: Uint8Array | null = null;

        if (data.audio) {
            const audioContext = new (window.AudioContext )();
            audioContextRef.current = audioContext;

            const reader = new FileReader();
            reader.onload = () => {
                const audioBuffer = audioContext.createBufferSource();
                audioContext.decodeAudioData(reader.result as ArrayBuffer, (buffer) => {
                    audioBuffer.buffer = buffer;
                    audioBuffer.connect(audioContext.destination);
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 256;
                    audioBuffer.connect(analyser);

                    const bufferLength = analyser.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);
                    analyserRef.current = analyser;

                    audioBuffer.start();

                    const animate = () => {
                        if (analyser && dataArray) {
                            analyser.getByteFrequencyData(dataArray);

                            waveRefs.current.forEach((wave, index) => {
                                if (wave && dataArray) {
                                    const height = (dataArray[index] / 255) * 30;
                                    wave.style.height = `${Math.max(1, height)}px`;
                                }
                            });
                        }
                        requestAnimationFrame(animate);
                    };

                    animate();
                });
            };
            reader.readAsArrayBuffer(data.audio);
        
        }
        console.log(data.audio)
        // Cleanup on unmount
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
      
    }, [data]);


    return (
        <div className="h-full">
            <div className=" mx-auto flex h-full justify-center items-center gap-1">
                {[...Array(35)].map((_, i) => (
                    <div
                        key={i}
                        ref={(el) => (waveRefs.current[i] = el!)}
                        className=" bg-black w-1 rounded "
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default AudioWave;
