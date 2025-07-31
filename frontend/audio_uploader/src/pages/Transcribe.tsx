import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { toast, ToastContainer } from 'react-toastify';
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import WaveSurfer from "wavesurfer.js";
    
const Transcribe: React.FC = () => {
    const backendURL = "http://localhost:8080/upload";

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleRewind = () => {
        const ws = wavesurferRef.current;
        if (ws) ws.seekTo(Math.max((ws.getCurrentTime() - 5) / ws.getDuration(), 0));
    };

    const handleFastForward = () => {
        const ws = wavesurferRef.current;
        if (ws) ws.seekTo(Math.min((ws.getCurrentTime() + 5) / ws.getDuration(), 1));
    };

    /* update current time of progress bar */
    const handleTimeUpdate = () => {
        const ws = wavesurferRef.current;
        if (ws) setCurrentTime(ws.getCurrentTime());
    };

    /* convert base64 to Int16Array */
    function base64ToInt16Array(base64: string): number[] {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const int16Arr = new Int16Array(bytes.buffer);
        return Array.from(int16Arr);
    }

    /* update subtitle column with audio duration */
    const [vttText, setVttText] = useState("")
    const [duration, setDuration] = useState(0);

    /* waveform */
    const [waveform, setWaveform] = useState<number[]>([]);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const waveformContainerRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(false);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = ["audio/mpeg", "audio/wav", "audio/wave", "audio/x-wav"];
        if (!validTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload an MP3 or WAV file.");
            event.target.value = ""; // reset input
            return;
        }
        toast.info("Uploading file...");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("filename", file.name);

        console.log(formData)

        try {
            const response = await axios.post(backendURL, formData);
            toast.success(response.data.filename + " uploaded!");
            setIsLoading(true);

            const filename = response.data.filename;
            await fetchVTT(filename);  // Only call once
        } catch (error) {
            toast.error("Upload failed!");
        }
    };

    const fetchVTT = async (filename: string) => {
        setIsLoading(true)
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            try {
                const res = await axios.get("http://localhost:8080/vtt-ready", {
                    params: { filename },
                });

                if (res.status == 200 && res.data) {
                    const { vtt_content, waveform, duration } = res.data;

                    if (vtt_content && vtt_content.trim() !== "") {
                        // set metadata
                        setVttText(vtt_content);
                        setWaveform(base64ToInt16Array(waveform));
                        setDuration(parseFloat(duration));

                        // notify user
                        setIsLoading(false);
                        toast.success("Transcription complete!");
                        return;
                    }
                }
            } catch (error) {
                console.error("Polling failed:", error);
            }
            attempts += 1
            await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s
        }
        toast.error("Transcription timed out.");
        setIsLoading(false);
    };

    useEffect(() => {
        function int16ArrayToWavBlob(int16Array: Int16Array, sampleRate: number): Blob {
            const numChannels = 1;
            const byteRate = sampleRate * numChannels * 2;
            const blockAlign = numChannels * 2;

            const buffer = new ArrayBuffer(44 + int16Array.length * 2);
            const view = new DataView(buffer);

            writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + int16Array.length * 2, true);
            writeString(view, 8, 'WAVE');

            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true); // PCM
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, byteRate, true);
            view.setUint16(32, blockAlign, true);
            view.setUint16(34, 16, true); // Bits per sample

            writeString(view, 36, 'data');
            view.setUint32(40, int16Array.length * 2, true);

            for (let i = 0; i < int16Array.length; i++) {
                view.setInt16(44 + i * 2, int16Array[i], true);
            }

            return new Blob([view], { type: 'audio/wav' });
        }

        function writeString(view: DataView, offset: number, str: string) {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        }
        if (waveform.length === 0) return;

        // Destroy previous instance if it exists
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
        }

        const ws = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#7c3aed',
            progressColor: '#a78bfa',
            cursorColor: '#fff',
            height: 96,
        });

        // Construct a WAV blob from Int16Array (assuming 44.1kHz, mono, PCM)
        const wavBlob = int16ArrayToWavBlob(new Int16Array(waveform), 44100);
        const blobUrl = URL.createObjectURL(wavBlob);

        ws.load(blobUrl);

        wavesurferRef.current = ws;

        const updateTime = () => {
            setCurrentTime(ws.getCurrentTime());
        };

        ws.on('audioprocess', updateTime);
        ws.on('interaction', updateTime);
        ws.on('ready', () => setDuration(ws.getDuration()));

        return () => {
            ws.un('audioprocess', updateTime);
            ws.un('interaction', updateTime);
            ws.destroy();
        };
    }, [waveform]);

    /* format time in minutes:seconds */
    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    return (
        <div className="bg-gradient-to-b from-primary to-secondary w-full text-white flex flex-col items-center justify-center">

            {/* Toast */}
            <ToastContainer
                position='top-right'
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                draggable
                theme="dark"
            />

            {/* Hidden file input */}
            <input
                type="file"
                accept=".mp3, .wav, audio/mpeg, audio/wav"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* fullscreen grid layout */}
            <div className="w-full pt-nav min-h-screen-minus-nav flex flex-col">

                {/* nav */}
                <div className="container mx-auto px-4 grid grid-rows-3 grid-flow-row gap-4">
                    <div className="flex flex-wrap items-center justify-center py-12 gap-4 row-span-1">

                        {/* Left: Title and description */}
                        <div className="max-w-xl flex-1 min-w-[280px]">
                            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                <span className="hover:cursor-default bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                                    Audio Playback
                                </span>
                            </h1>
                            <p className="hover:cursor-default text-xl text-gray-300 leading-relaxed mt-4">
                                Upload your audio file to begin (.mp3 / .wav)
                            </p>
                        </div>

                        {/* Right: Upload button */}
                        <div className="flex flex-shrink-0 items-start">
                            <button
                                type='button'
                                onClick={handleButtonClick}
                                className="relative group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded-md text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 active:scale-95"
                            >
                                <i className="fas fa-upload relative z-10"></i>
                                <span className="relative z-10">Upload</span>
                                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute inset-0 rounded-md bg-white/20 opacity-0 group-hover:animate-ping" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom: Audio Playback Placeholder */}
                    <div className="bg-gray-850 px-6 py-12 border-t border-gray-700 row-span-2">
                        {/* Future Audio Playback Component Goes Here */}
                        <div className='container mx-auto flex flex-col grid lg:grid-cols-3 gap-16 h-[calc(60vh-20rem)]'>
                            <div className="relative flex-grow mt-6 p-4 bg-gray-800 border border-gray-700 rounded text-gray-300 text-center text-gray-300 lg:col-span-2">
                                {/* audio waveform */}
                                {isLoading ? (
                                    <div className="animate-pulse">
                                        <h2 className="text-lg font-semibold mb-2">Loading audio...</h2>
                                        <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                                        <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto mb-2"></div>
                                        <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto mb-2"></div>
                                        <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-lg font-semibold mb-2">Audio Playback Area</h2>
                                        {waveform.length > 0 ? (
                                            <div id="waveform" className="w-full h-24"></div>
                                        ) : (
                                            <p className="italic text-gray-500">Upload an audio file to see the waveform.</p>
                                        )}
                                    </div>
                                )}

                                {/* Progress Bar */}
                                <div className="absolute inset-x-0 md:-bottom-8 lg:bottom-12 flex justify-center">
                                    <span className="text-white text-sm font-mono">{formatTime(currentTime)}</span>
                                    <div className="w-2/3 bg-white rounded h-2 m-2">
                                        <div
                                            className="bg-purple-500 h-2 rounded"
                                            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-white text-sm font-mono">{formatTime(duration)}</span>
                                </div>

                                {/* Controls */}
                                <div className="absolute inset-x-0 md:-bottom-20 lg:bottom-0 flex justify-center gap-6 p-4">
                                    <button
                                        onClick={handleRewind}
                                        className="text-white hover:text-purple-400 transition"
                                    >
                                        <i className="fas fa-backward fa-lg"></i>
                                    </button>
                                    <button
                                        onClick={togglePlayPause}
                                        className="text-white hover:text-purple-400 transition"
                                    >
                                        {isPlaying ? (
                                            <i className="fas fa-pause fa-lg"></i>
                                        ) : (
                                            <i className="fas fa-play fa-lg"></i>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleFastForward}
                                        className="text-white hover:text-purple-400 transition"
                                    >
                                        <i className="fas fa-forward fa-lg"></i>
                                    </button>
                                </div>
                            </div>

                            {/* subtitle column (loading animation & injecting of transcription)*/}
                            {isLoading ? (
                                <div className="h-[calc(60vh-20rem)] mt-6 p-4 bg-gray-800 border border-gray-700 rounded text-gray-300 animate-pulse">
                                    <h2 className="text-lg font-semibold mb-2">Transcript</h2>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center flex-grow h-[calc(60vh-20rem)] overflow-y-auto overscroll-contain mt-6 p-4 bg-gray-800 border border-gray-700 rounded text-gray-300">
                                    <h2 className="text-lg font-semibold mb-2">Transcript</h2>
                                    {vttText ? (
                                        <pre className="whitespace-pre-wrap text-sm text-gray-400 mx-auto">{vttText}</pre>
                                    ) : (
                                        <p className="italic text-gray-500">Transcript will appear here once processed.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transcribe;
