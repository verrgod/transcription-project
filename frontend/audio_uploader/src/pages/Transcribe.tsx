import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { toast, ToastContainer } from 'react-toastify';
import { useRef, useState } from "react";
import axios from "axios";

const Transcribe: React.FC = () => {
    const backendURL = "http://localhost:8080/upload";

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
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
        const audio = audioRef.current;
        if (audio) audio.currentTime = Math.max(audio.currentTime - 5, 0);
    };

    const handleFastForward = () => {
        const audio = audioRef.current;
        if (audio) audio.currentTime = Math.min(audio.currentTime + 5, duration);
    };

    /* update current time of progress bar */
    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (audio) setCurrentTime(audio.currentTime);
    };

    /* update subtitle column with audio duration */
    const [vttText, setVttText] = useState("")
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

                if (res.status == 200 && typeof res.data == "string") {
                    setVttText(res.data);
                    setIsLoading(false);
                    toast.success("Transcription complete!");
                    return;
                }
            } catch (error) {
                console.error("Polling failed:", error);
            }
            await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s
        }
        toast.error("Transcription timed out.");
        setIsLoading(false);
    };

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
                        <div className='container mx-auto grid lg:grid-cols-3 gap-16 h-80'>
                            <div className="relative mt-6 p-4 bg-gray-800 border border-gray-700 rounded text-gray-300 text-center text-gray-500 italic col-span-2">
                                Audio playback area (coming soon)
                                {/* Progress Bar */}
                                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-2/3 bg-white rounded h-2 m-2">
                                    <div
                                        className="bg-purple-500 h-2 rounded"
                                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-6 p-4">
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
                                <div className="h-80 mt-6 p-4 bg-gray-800 border border-gray-700 rounded text-gray-300 animate-pulse">
                                    <h2 className="text-lg font-semibold mb-2">Transcript</h2>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-80 overflow-y-auto overscroll-contain mt-6 p-4 bg-gray-800 border border-gray-700 rounded text-gray-300">
                                    <h2 className="text-lg font-semibold mb-2">Transcript</h2>
                                    {vttText ? (
                                        <pre className="whitespace-pre-wrap text-sm text-gray-400">{vttText}</pre>
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
