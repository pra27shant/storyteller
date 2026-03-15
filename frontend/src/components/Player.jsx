import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { stories, users } from '../services/api';
import { speak, isSupported } from '../services/voice';
import VoiceControl from './VoiceControl';

export default function Player() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Playback state
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    stories
      .getById(id)
      .then((data) => setStory(data.story ?? data))
      .catch(() => setError('Failed to load story.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Track history when story loads
  useEffect(() => {
    if (story) {
      users.addHistory({ storyId: story._id ?? story.id }).catch(() => {});
    }
  }, [story]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const handleReadAloud = useCallback(() => {
    if (!story?.content) return;

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    const utt = speak(story.content, { rate: speed });
    if (!utt) return;

    utteranceRef.current = utt;
    setPlaying(true);

    // Approximate progress based on average speaking rate
    const AVG_WORDS_PER_MIN = 150;
    const words = story.content.split(/\s+/).length;
    const estimatedDuration = (words / AVG_WORDS_PER_MIN) * 60 * 1000 / speed;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (estimatedDuration / 500));
      });
    }, 500);

    utt.onend = () => {
      clearInterval(interval);
      setPlaying(false);
      setProgress(100);
    };
  }, [story, playing, speed]);

  const handlePause = useCallback(() => {
    if (playing) {
      window.speechSynthesis.pause();
      setPlaying(false);
    }
  }, [playing]);

  const handleResume = useCallback(() => {
    window.speechSynthesis.resume();
    setPlaying(true);
  }, []);

  const adjustSpeed = useCallback(
    (delta) => {
      setSpeed((s) => {
        const next = Math.round((s + delta) * 10) / 10;
        return Math.max(0.5, Math.min(2, next));
      });
    },
    []
  );

  const handleVoice = useCallback(
    (text) => {
      if (/pause/i.test(text)) return handlePause();
      if (/resume|play|continue/i.test(text)) {
        return playing ? null : handleResume();
      }
      if (/speed up|faster/i.test(text)) return adjustSpeed(0.25);
      if (/slow down|slower/i.test(text)) return adjustSpeed(-0.25);
      if (/repeat|restart/i.test(text)) {
        window.speechSynthesis.cancel();
        setPlaying(false);
        setProgress(0);
        setTimeout(() => handleReadAloud(), 100);
      }
    },
    [handlePause, handleResume, adjustSpeed, handleReadAloud, playing]
  );

  if (loading) {
    return (
      <div className="loading-screen" role="status">
        <div className="spinner" />
        <p>Loading story…</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <main className="player-page">
        <div className="error-msg" role="alert">
          {error || 'Story not found.'}
        </div>
      </main>
    );
  }

  return (
    <main className="player-page">
      <header className="player-header">
        <div className="player-meta">
          <div className="cover-placeholder" aria-hidden="true">
            📖
          </div>
          <div>
            <h1>{story.title}</h1>
            {story.author && <p className="story-author">by {story.author}</p>}
            {story.genre && <span className="story-genre">{story.genre}</span>}
          </div>
        </div>
        <VoiceControl onCommand={handleVoice} />
      </header>

      {story.description && (
        <p className="player-description">{story.description}</p>
      )}

      <p className="voice-hint">
        🎤 &quot;pause&quot;, &quot;resume&quot;, &quot;speed up&quot;, &quot;slow down&quot;, &quot;repeat&quot;
      </p>

      {/* Progress bar */}
      <div className="progress-container" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Playback controls */}
      <div className="playback-controls">
        <button
          className="control-btn"
          onClick={() => {
            window.speechSynthesis.cancel();
            setPlaying(false);
            setProgress(0);
            setTimeout(() => handleReadAloud(), 100);
          }}
          aria-label="Restart"
          title="Restart"
        >
          ⏮
        </button>

        <button
          className="control-btn control-btn-main"
          onClick={playing ? handlePause : (progress > 0 && !playing ? handleResume : handleReadAloud)}
          aria-label={playing ? 'Pause' : 'Play'}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </button>

        <button
          className="control-btn"
          onClick={() => adjustSpeed(-0.25)}
          aria-label="Slow down"
          title="Slow down"
        >
          🐢
        </button>

        <span className="speed-display" aria-label={`Speed ${speed}x`}>
          {speed.toFixed(1)}×
        </span>

        <button
          className="control-btn"
          onClick={() => adjustSpeed(0.25)}
          aria-label="Speed up"
          title="Speed up"
        >
          🐇
        </button>
      </div>

      {isSupported() && (
        <button className="btn-primary read-aloud-btn" onClick={handleReadAloud}>
          {playing ? '⏹ Stop Reading' : '🔊 Read Aloud'}
        </button>
      )}

      {/* Story content */}
      {story.content && (
        <section className="story-content" ref={contentRef} aria-label="Story text">
          {story.content.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>
      )}
    </main>
  );
}
