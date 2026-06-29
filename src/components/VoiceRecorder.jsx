import React, { useState, useRef } from 'react';

const VoiceRecorder = ({ onAudioReady }) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/ogg' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        if (onAudioReady) onAudioReady(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert("Impossible d'accéder au microphone : " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const clearAudio = () => {
    setAudioURL(null);
    if (onAudioReady) onAudioReady(null);
  };

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
      {!recording ? (
        <button type="button" onClick={startRecording} style={{ background: '#B41E1E', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
          🎙️ Enregistrer un message vocal
        </button>
      ) : (
        <button type="button" onClick={stopRecording} style={{ background: '#FF9800', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', animation: 'pulse 1s infinite' }}>
          ⏹️ Arrêter l'enregistrement
        </button>
      )}
      {audioURL && (
        <>
          <audio controls src={audioURL} style={{ maxWidth: '200px' }} />
          <button type="button" onClick={clearAudio} style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer' }}>✕</button>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;