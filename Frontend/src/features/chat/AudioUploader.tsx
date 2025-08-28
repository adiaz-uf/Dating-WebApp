import React, { useRef, useState } from "react";
import { MdUpload, MdSend, MdDelete, MdAudioFile } from "react-icons/md";
import { Button } from "../../components/Button";

interface AudioUploaderProps {
  onSendAudio: (audioFile: File) => void;
  onClose: () => void;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ onSendAudio, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid audio file (MP3, WAV, MP4, AAC, OGG, WebM)');
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSend = () => {
    if (selectedFile) {
      onSendAudio(selectedFile);
      resetSelection();
      onClose();
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setAudioUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="absolute bottom-14 left-0 bg-white border border-pink-200 rounded-lg shadow-lg p-4 w-80 z-[9999]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Upload Audio File</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Error message */}
        {error && (
          <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* File input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload button or file info */}
        {!selectedFile ? (
          <div className="text-center">
            <Button
              onClick={handleUploadClick}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-3 rounded-lg w-full"
            >
              <MdUpload className="text-lg mr-2" />
              Choose Audio File
            </Button>
            <div className="text-xs text-gray-500 mt-2">
              Supported: MP3, WAV, MP4, AAC, OGG, WebM (Max 10MB)
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* File info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MdAudioFile className="text-pink-500 text-lg" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </div>
                </div>
              </div>
            </div>

            {/* Audio preview */}
            {audioUrl && (
              <div className="flex items-center justify-center">
                <audio 
                  controls 
                  className="w-full"
                  style={{ height: '40px' }}
                >
                  <source src={audioUrl} type={selectedFile.type} />
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={resetSelection}
                variant="outline"
                className="px-3 py-2 flex-1"
              >
                <MdDelete className="text-lg mr-1" />
                Remove
              </Button>
              <Button
                onClick={handleSend}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 flex-1"
              >
                <MdSend className="text-lg mr-1" />
                Send
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Arrow pointing to button */}
      <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-r border-b border-pink-200 transform rotate-45"></div>
    </div>
  );
};
