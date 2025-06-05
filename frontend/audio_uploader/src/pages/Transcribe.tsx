import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { toast, ToastContainer } from 'react-toastify';
import { useRef } from "react";
import axios from "axios";

const Transcribe: React.FC = () => {
    const backendURL = "http://localhost:8080/upload";
    
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        // fetch below
        try {
            const response = await axios.post(backendURL, formData);
            toast.success(response.data.filename + " uploaded!");
        }
        catch (error) { 
            toast.error("Upload failed!");
            console.error("Upload error: ", error);
        }
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
            <div className="h-screen flex flex-col">

                {/* nav */}
                <div className="flex-1">
                    <div className="container mx-auto mt-20 px-6">
                        <div className="flex flex-wrap items-start justify-between py-12 gap-6">

                            {/* Left: Title and description */}
                            <div className="max-w-4xl flex-1 min-w-[280px]">
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
                    </div>

                    {/* Bottom: Audio Playback Placeholder */}
                    <div className="flex-[3] bg-gray-850 px-6 py-12 border-t border-gray-700">
                        {/* Future Audio Playback Component Goes Here */}
                        <div className="text-center text-gray-500 italic">
                            Audio playback area (coming soon)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transcribe;
