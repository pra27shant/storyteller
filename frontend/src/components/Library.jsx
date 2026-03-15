import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { stories, users } from '../services/api';
import VoiceControl from './VoiceControl';

export default function Library() {
  const navigate = useNavigate();
  const [storyList, setStoryList] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (genre) filters.genre = genre;
      if (search) filters.search = search;
      const data = await stories.getAll(filters);
      setStoryList(Array.isArray(data) ? data : data.stories ?? []);
    } catch {
      setError('Failed to load stories.');
    } finally {
      setLoading(false);
    }
  }, [genre, search]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    stories.getGenres().then((data) => {
      setGenres(Array.isArray(data) ? data : data.genres ?? []);
    }).catch(() => {});

    users.getRecommendations().then((data) => {
      setRecommendations(Array.isArray(data) ? data : data.recommendations ?? []);
    }).catch(() => {});
  }, []);

  const handleVoice = useCallback(
    (text) => {
      const playMatch = text.match(/^play\s+(.+)/i);
      if (playMatch) {
        const title = playMatch[1];
        const found = storyList.find((s) =>
          s.title?.toLowerCase().includes(title)
        );
        if (found) navigate(`/player/${found._id ?? found.id}`);
        return;
      }

      const showMatch = text.match(/^show\s+(.+)/i);
      if (showMatch) {
        setGenre(showMatch[1]);
        return;
      }

      const searchMatch = text.match(/^search\s+(.+)/i);
      if (searchMatch) {
        setSearch(searchMatch[1]);
      }
    },
    [storyList, navigate]
  );

  return (
    <main className="library-page">
      <header className="library-header">
        <h1>Your Library</h1>
        <VoiceControl onCommand={handleVoice} />
      </header>

      <p className="voice-hint">
        🎤 &quot;play [title]&quot;, &quot;show [genre]&quot;, &quot;search [query]&quot;
      </p>

      <div className="library-filters">
        <input
          type="search"
          placeholder="Search stories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search stories"
          className="search-input"
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          aria-label="Filter by genre"
          className="genre-select"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={typeof g === 'string' ? g : g._id ?? g.id} value={typeof g === 'string' ? g : g.name}>
              {typeof g === 'string' ? g : g.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="error-msg" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-screen" role="status">
          <div className="spinner" />
          <p>Loading stories…</p>
        </div>
      ) : storyList.length === 0 ? (
        <div className="empty-state">
          <p>No stories found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="story-grid" role="list">
          {storyList.map((story) => (
            <article
              key={story._id ?? story.id}
              className="story-card"
              role="listitem"
              tabIndex={0}
              onClick={() => navigate(`/player/${story._id ?? story.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/player/${story._id ?? story.id}`);
              }}
              aria-label={`Play ${story.title}`}
            >
              <h3>{story.title}</h3>
              {story.author && <p className="story-author">by {story.author}</p>}
              {story.genre && <span className="story-genre">{story.genre}</span>}
              {story.description && (
                <p className="story-desc">{story.description}</p>
              )}
            </article>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <section className="recommendations" aria-label="Recommended stories">
          <h2>Recommended for You</h2>
          <div className="story-grid" role="list">
            {recommendations.map((story) => (
              <article
                key={story._id ?? story.id}
                className="story-card"
                role="listitem"
                tabIndex={0}
                onClick={() => navigate(`/player/${story._id ?? story.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/player/${story._id ?? story.id}`);
                }}
                aria-label={`Play ${story.title}`}
              >
                <h3>{story.title}</h3>
                {story.author && <p className="story-author">by {story.author}</p>}
                {story.genre && <span className="story-genre">{story.genre}</span>}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
