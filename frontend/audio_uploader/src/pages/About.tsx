import React from 'react';

const About: React.FC = () => {
    return (
        <div className="bg-gradient-to-b from-primary to-secondary w-full text-white flex flex-col items-center justify-center">

            {/* fullscreen grid layout */}
            <div className="min-h-screen flex flex-col">
                <div className="container mx-auto grid lg:grid-cols-2 gap-16">
                    {/* LEFT: Text, CTA */}
                    <div className="flex items-center">
                        <div className="space-y-6">
                            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                <span className="hover:cursor-default bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                                    About Me
                                </span>
                            </h1>
                            <p className="hover:cursor-default text-xl text-gray-300 leading-relaxed">
                                I love music.
                            </p>
                            <div className="opacity-0">
                                <button className="px-8 py-4 rounded-full text-lg font-semibold cursor-default">
                                    Invisible
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: profile pic */}
                    <div className="flex items-center justify-center">
                        <img
                            src="/images/chongyun.png"
                            className="w-[400px] h-[400px] rounded-full"
                        />
                    </div>
                </div>
            </div>

            {/* Second Section (Uploader or Features) */}
            <section className="w-full px-6 py-16 bg-secondary">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold">Features</h2>
                    <p className="text-lg text-gray-300">
                        Below are some features in this project.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default About;