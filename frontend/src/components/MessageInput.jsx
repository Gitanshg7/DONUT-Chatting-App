import { useState, useRef } from 'react';
import api from '../api/axios';

function MessageInput({ receiverUsername, onMessageSent }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // --- Text Message ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const response = await api.post('/messages/send', {
        receiverUsername,
        content: content.trim(),
        type: 'TEXT',
      });
      onMessageSent(response.data);
      setContent('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // --- File / Image Upload ---
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav'];
    if (!allowedTypes.some(t => file.type.startsWith(t.split('/')[0]) || file.type === t)) {
      alert('Unsupported file type. Allowed: JPG, PNG, PDF, WEBM, MP3, WAV');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      let type = 'FILE';
      if (file.type.startsWith('image')) type = 'IMAGE';
      else if (file.type.startsWith('audio')) type = 'AUDIO';

      const response = await api.post('/messages/send', {
        receiverUsername,
        type,
        fileUrl: uploadRes.data.fileUrl,
        content: file.name,
      });
      onMessageSent(response.data);
    } catch (err) {
      console.error('Failed to upload file:', err);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Voice Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
        setRecordingTime(0);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });

        setSending(true);
        try {
          const formData = new FormData();
          formData.append('file', audioFile);

          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const response = await api.post('/messages/send', {
            receiverUsername,
            type: 'AUDIO',
            fileUrl: uploadRes.data.fileUrl,
            content: 'Voice message',
          });
          onMessageSent(response.data);
        } catch (err) {
          console.error('Failed to send voice message:', err);
        } finally {
          setSending(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required for voice messages.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatRecordingTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="px-6 py-4 glass border-t border-dark-700/50">
      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl animate-pulse">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
          <span className="text-sm text-red-400 font-medium">Recording…</span>
          <span className="text-sm text-red-400/70 font-mono">{formatRecordingTime(recordingTime)}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* File upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,application/pdf,audio/webm,audio/mp3,audio/mpeg,audio/wav"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-input"
        />
        <button
          id="file-upload-button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || isRecording}
          className="p-3 text-dark-400 hover:text-primary-400 hover:bg-dark-800/50 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Attach file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Text input */}
        <input
          id="message-input"
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? 'Recording audio…' : 'Type a message...'}
          disabled={isRecording}
          className="flex-1 px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/30 transition-all duration-200 disabled:opacity-40"
          autoComplete="off"
        />

        {/* Voice record button */}
        <button
          id="voice-record-button"
          type="button"
          onClick={toggleRecording}
          disabled={sending}
          className={`p-3 rounded-xl transition-all duration-200 ${
            isRecording
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-2 ring-red-500/40'
              : 'text-dark-400 hover:text-primary-400 hover:bg-dark-800/50'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title={isRecording ? 'Stop recording' : 'Record voice message'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isRecording ? (
              <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2} />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
            )}
          </svg>
        </button>

        {/* Send button */}
        <button
          id="send-message-button"
          type="submit"
          disabled={!content.trim() || sending || isRecording}
          className="p-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-primary-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
