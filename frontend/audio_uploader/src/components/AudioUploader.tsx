import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const AudioUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://backend:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('✅ File uploaded successfully!');
      } else {
        setMessage('❌ Upload failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Error during upload.');
    }

    setUploading(false);
  };

   return (
    <div className="absolute top-4 right-4 z-10">
      <h2 className="text-lg font-semibold mb-2">Upload audio file here!</h2>
      <label className="cursor-pointer inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        <FontAwesomeIcon icon={faUpload} />
        <span>{uploading ? 'Uploading...' : 'Upload'}</span>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {selectedFile && (
        <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
      )}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Transcribing...' : 'Transcribe it!'}
      </button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
};

export default AudioUploader;