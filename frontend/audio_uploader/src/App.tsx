import React from 'react';

const App: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-primary to-secondary w-full text-white flex flex-col items-center justify-center">

      {/* fullscreen grid layout */}
      <div className="h-screen flex flex-col">

        {/* nav */}
        <nav className="flex justify-between items-center px-12 w-full p-6">
          <div className="font-sans text-xl font-bold hover:cursor-default">verr</div>
          <div className="flex gap-6">
            <a href="#" className="font-sans text-xl hover:text-purple-400 transition-colors px-4">Home</a>
            <a href="#" className="font-sans text-xl hover:text-purple-400 transition-colors px-4">Transcribe</a>
            <a href="#" className="font-sans text-xl hover:text-purple-400 transition-colors px-4">About</a>
          </div>
        </nav>
        <div className="flex-1">
          <div className="container mx-auto grid lg:grid-cols-2 gap-16 h-full">

            {/* LEFT: Text, CTA */}
            <div className="flex items-center">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="hover:cursor-default bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                    Audio Transcribe
                  </span>
                </h1>
                <p className="hover:cursor-default text-xl text-gray-300 leading-relaxed">
                  Upload an audio file and get it transcribed.
                </p>
                <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 active:scale-95">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:animate-ping" />
                </button>
              </div>
            </div>

            {/* RIGHT: Cat Image */}
            <div className="flex items-center justify-center">
              <img
                src="/images/catHeadphones.png"
                alt="Cat with Headphones"
                className="max-w-full max-h-[80%] object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
