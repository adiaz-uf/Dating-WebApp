import React, { useState, useRef, useEffect } from "react";
import { MdMic, MdStop, MdSend, MdDelete } from "react-icons/md";
import { Button } from "../../components/Button";

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob) => void;
  onClose: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSendAudio, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check permissions on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permission.state === 'granted') {
          setPermissionChecked(true);
        } else if (permission.state === 'prompt') {
          // Permission will be requested when user clicks record
          setPermissionChecked(true);
        } else {
          // Permission denied
          setPermissionChecked(false);
        }
      } else {
        // Fallback for browsers without permissions API
        setPermissionChecked(true);
      }
    } catch (error) {
      console.warn('Could not check microphone permission:', error);
      setPermissionChecked(true);
    }
  };

  const startRecording = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        alert('Audio recording is not supported in your browser.');
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecording(true);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      // Specific error messages
      const err = error as any;
      if (err.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone permissions in your browser settings and try again.');
      } else if (err.name === 'NotFoundError') {
        alert('No microphone found. Please check that your microphone is connected and try again.');
      } else if (err.name === 'NotSupportedError') {
        alert('Your browser does not support audio recording. Please use Chrome, Firefox, or Safari.');
      } else if (err.name === 'NotReadableError') {
        alert('Microphone is being used by another application. Please close other apps using the microphone and try again.');
      } else {
        alert(`Error accessing microphone: ${err.message || 'Unknown error'}. Please check your browser settings and microphone connection.`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const sendAudio = () => {
    if (hasRecording && audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onSendAudio(audioBlob);
      resetRecording();
      onClose();
    }
  };

  const resetRecording = () => {
    setHasRecording(false);
    setRecordingTime(0);
    setAudioUrl(null);
    audioChunksRef.current = [];
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-14 left-0 bg-white border border-pink-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Voice Message</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Permission status */}
        {!permissionChecked && (
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-700 font-medium">⚠️ Microphone Permission Required</div>
            <div className="text-xs text-yellow-600 mt-1">
              Please allow microphone access when prompted by your browser
            </div>
          </div>
        )}

        {/* Recording Timer */}
        <div className="text-center">
          <div className="text-lg font-mono text-pink-600">
            {formatTime(recordingTime)}
          </div>
          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Recording...
            </div>
          )}
        </div>

        {/* Audio Playback */}
        {hasRecording && audioUrl && (
          <div className="flex items-center justify-center">
            <audio 
              ref={audioRef}
              controls 
              className="w-full"
              style={{ height: '40px' }}
            >
              <source src={audioUrl} type="audio/webm" />
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          {!hasRecording && (
            <>
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full"
                >
                  <MdMic className="text-lg" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
                >
                  <MdStop className="text-lg" />
                  Stop
                </Button>
              )}
            </>
          )}

          {hasRecording && (
            <div className="flex gap-2">
              <Button
                onClick={resetRecording}
                variant="outline"
                className="px-3 py-2"
              >
                <MdDelete className="text-lg" />
                Delete
              </Button>
              <Button
                onClick={sendAudio}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2"
              >
                <MdSend className="text-lg" />
                Send
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Arrow pointing to button */}
      <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-r border-b border-pink-200 transform rotate-45"></div>
    </div>
  );
};