const Preference = require('../models/Preference');
const Story = require('../models/Story');

function getRecommendations(userId) {
  const prefs = Preference.getByUserId(userId);
  const history = Preference.getHistory(userId);

  // Get IDs of completed stories to exclude
  const completedIds = new Set(
    history.filter((h) => h.completed).map((h) => h.story_id)
  );

  // Get all stories
  let allStories = Story.findAll({ limit: 100 });

  // Exclude completed stories
  allStories = allStories.filter((s) => !completedIds.has(s.id));

  if (!prefs || !prefs.favorite_genres || prefs.favorite_genres.length === 0) {
    // No preferences set — return most recent stories
    return allStories.slice(0, 10);
  }

  const favoriteGenres = new Set(
    prefs.favorite_genres.map((g) => g.toLowerCase())
  );

  // Score stories: preferred genres get higher priority
  const scored = allStories.map((story) => {
    let score = 0;
    if (story.genre && favoriteGenres.has(story.genre.toLowerCase())) {
      score += 10;
    }
    return { ...story, score };
  });

  // Sort by score descending, then by created_at descending
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Return top 10 without the score field
  return scored.slice(0, 10).map(({ score, ...story }) => story);
}

module.exports = { getRecommendations };
