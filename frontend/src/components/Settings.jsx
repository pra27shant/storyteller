import { useState, useEffect, useCallback } from 'react';
import { users } from '../services/api';
import VoiceControl from './VoiceControl';

const GENRE_OPTIONS = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Horror',
  'Adventure',
  'Historical',
  'Comedy',
  'Drama',
  'Thriller',
];

export default function Settings() {
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis?.getVoices() ?? [];
      setVoices(available);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () =>
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // Load saved preferences
  useEffect(() => {
    users
      .getPreferences()
      .then((data) => {
        const prefs = data.preferences ?? data;
        if (prefs.favoriteGenres) setFavoriteGenres(prefs.favoriteGenres);
        if (prefs.voiceURI) setVoiceURI(prefs.voiceURI);
        if (prefs.speed) setSpeed(prefs.speed);
      })
      .catch(() => {});
  }, []);

  const toggleGenre = (genre) => {
    setFavoriteGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await users.updatePreferences({ favoriteGenres, voiceURI, speed });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleVoice = useCallback(
    (text) => {
      const speedMatch = text.match(/set speed (?:to )?(\d+\.?\d*)/i);
      if (speedMatch) {
        const val = parseFloat(speedMatch[1]);
        if (val >= 0.5 && val <= 2) setSpeed(val);
        return;
      }

      const addGenre = text.match(/add (\w+) genre/i);
      if (addGenre) {
        const g = addGenre[1];
        const match = GENRE_OPTIONS.find(
          (o) => o.toLowerCase() === g.toLowerCase()
        );
        if (match && !favoriteGenres.includes(match)) {
          setFavoriteGenres((prev) => [...prev, match]);
        }
      }
    },
    [favoriteGenres]
  );

  return (
    <main className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <VoiceControl onCommand={handleVoice} />
      </header>

      <p className="voice-hint">
        🎤 &quot;set speed to 1.5&quot;, &quot;add fantasy genre&quot;
      </p>

      {error && (
        <div className="error-msg" role="alert">
          {error}
        </div>
      )}
      {saved && (
        <div className="success-msg" role="status">
          Preferences saved!
        </div>
      )}

      <section className="settings-section">
        <h2>Favorite Genres</h2>
        <div className="genre-checkboxes">
          {GENRE_OPTIONS.map((g) => (
            <label key={g} className="checkbox-label">
              <input
                type="checkbox"
                checked={favoriteGenres.includes(g)}
                onChange={() => toggleGenre(g)}
              />
              {g}
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2>Narrator Voice</h2>
        <select
          value={voiceURI}
          onChange={(e) => setVoiceURI(e.target.value)}
          aria-label="Preferred narrator voice"
          className="genre-select"
        >
          <option value="">Default</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </section>

      <section className="settings-section">
        <h2>Audio Speed</h2>
        <div className="speed-slider">
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            aria-label="Audio speed"
          />
          <span className="speed-display">{speed.toFixed(1)}×</span>
        </div>
      </section>

      <button
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </main>
  );
}
