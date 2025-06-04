import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Transcribe: React.FC = () => {
    return (
        <div className="bg-gradient-to-b from-primary to-secondary w-full text-white flex flex-col items-center justify-center">

            {/* fullscreen grid layout */}
            <div className="h-screen flex flex-col">

                {/* nav */}
                <div className="flex-1">
                    <div className="container mx-auto grid lg:grid-cols-2 gap-16 h-full">

                        {/* top: audio file upload title & upload button */}
                        <div className="flex-1 flex items-center justify-center px-6 py-12">
                            <div className="space-y-6 max-w-4xl text-center">
                                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                    <span className="hover:cursor-default bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                                        Audio Playback
                                    </span>
                                </h1>
                                <p className="hover:cursor-default text-xl text-gray-300 leading-relaxed">
                                    Upload your audio file to begin (.mp3 / .wav)
                                </p>
                                <button className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded-md text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 active:scale-95">
                                    <i className="fas fa-upload relative z-10"></i>
                                    <span className="relative z-10">Upload</span>
                                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute inset-0 rounded-md bg-white/20 opacity-0 group-hover:animate-ping" />
                                </button>
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
        </div>
    );
};

export default Transcribe;
