import React from 'react';
import AudioUploader from './components/AudioUploader.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Audio Transcription Uploader</h1>
        <p className="text-gray-600 mt-2">Upload an audio file and get it transcribed!</p>
      </header>

      <main className="w-full max-w-md">
        <AudioUploader />
      </main>
    </div>
  );
};

export default App;
