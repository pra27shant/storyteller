import { useState, useCallback } from 'react';
import { startListening, stopListening, isSupported } from '../services/voice';

export default function VoiceControl({ onCommand }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  const toggle = useCallback(() => {
    if (listening && recognition) {
      stopListening(recognition);
      setRecognition(null);
      setListening(false);
      return;
    }

    const rec = startListening(
      (text) => {
        setTranscript(text);
        setListening(false);
        setRecognition(null);
        onCommand?.(text.toLowerCase());
        setTimeout(() => setTranscript(''), 3000);
      },
      () => {
        setListening(false);
        setRecognition(null);
      }
    );

    if (rec) {
      setRecognition(rec);
      setListening(true);
    }
  }, [listening, recognition, onCommand]);

  if (!isSupported()) return null;

  return (
    <div className="voice-control">
      <button
        className={`voice-btn ${listening ? 'listening' : ''}`}
        onClick={toggle}
        aria-label={listening ? 'Stop listening' : 'Start voice command'}
        title={listening ? 'Listening…' : 'Voice command'}
      >
        🎤
      </button>
      {transcript && (
        <span className="voice-transcript" aria-live="polite">
          "{transcript}"
        </span>
      )}
    </div>
  );
}
