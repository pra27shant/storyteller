const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

function getByUserId(userId) {
  const stmt = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
  const row = stmt.get(userId);
  if (row && row.favorite_genres) {
    row.favorite_genres = JSON.parse(row.favorite_genres);
  }
  return row;
}

function upsert(userId, prefs) {
  const existing = getByUserId(userId);
  const now = new Date().toISOString();

  const favoriteGenres = prefs.favorite_genres
    ? JSON.stringify(prefs.favorite_genres)
    : (existing ? JSON.stringify(existing.favorite_genres) : '[]');
  const preferredNarrator = prefs.preferred_narrator !== undefined
    ? prefs.preferred_narrator
    : (existing ? existing.preferred_narrator : null);
  const audioSpeed = prefs.audio_speed !== undefined
    ? prefs.audio_speed
    : (existing ? existing.audio_speed : 1.0);

  if (existing) {
    const stmt = db.prepare(`
      UPDATE user_preferences
      SET favorite_genres = ?, preferred_narrator = ?, audio_speed = ?, updated_at = ?
      WHERE user_id = ?
    `);
    stmt.run(favoriteGenres, preferredNarrator, audioSpeed, now, userId);
  } else {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO user_preferences (id, user_id, favorite_genres, preferred_narrator, audio_speed, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, favoriteGenres, preferredNarrator, audioSpeed, now);
  }

  return getByUserId(userId);
}

function addToHistory(userId, storyId, progress) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const completed = progress >= 100 ? 1 : 0;

  // Check if there's an existing entry for this user+story
  const existingStmt = db.prepare(
    'SELECT id FROM listening_history WHERE user_id = ? AND story_id = ? ORDER BY listened_at DESC LIMIT 1'
  );
  const existing = existingStmt.get(userId, storyId);

  if (existing) {
    const updateStmt = db.prepare(
      'UPDATE listening_history SET progress = ?, completed = ?, listened_at = ? WHERE id = ?'
    );
    updateStmt.run(progress, completed, now, existing.id);
    return { id: existing.id, user_id: userId, story_id: storyId, progress, completed, listened_at: now };
  }

  const stmt = db.prepare(
    'INSERT INTO listening_history (id, user_id, story_id, progress, completed, listened_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(id, userId, storyId, progress, completed, now);

  return { id, user_id: userId, story_id: storyId, progress, completed, listened_at: now };
}

function getHistory(userId) {
  const stmt = db.prepare(`
    SELECT lh.*, s.title, s.author, s.genre, s.description, s.duration, s.cover_image, s.audio_url
    FROM listening_history lh
    JOIN stories s ON lh.story_id = s.id
    WHERE lh.user_id = ?
    ORDER BY lh.listened_at DESC
  `);
  return stmt.all(userId);
}

module.exports = { getByUserId, upsert, addToHistory, getHistory };
