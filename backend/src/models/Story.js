const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

function create(storyData) {
  const id = uuidv4();
  const now = new Date().toISOString();

  const {
    title,
    author = null,
    genre = null,
    description = null,
    content = null,
    duration = null,
    cover_image = null,
    audio_url = null,
  } = storyData;

  const stmt = db.prepare(`
    INSERT INTO stories (id, title, author, genre, description, content, duration, cover_image, audio_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, title, author, genre, description, content, duration, cover_image, audio_url, now, now);

  return { id, title, author, genre, description, content, duration, cover_image, audio_url, created_at: now, updated_at: now };
}

function findAll(filters = {}) {
  const { genre, author, search, page = 1, limit = 20 } = filters;
  const conditions = [];
  const params = [];

  if (genre) {
    conditions.push('genre = ?');
    params.push(genre);
  }
  if (author) {
    conditions.push('author = ?');
    params.push(author);
  }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ? OR author LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  let sql = 'SELECT * FROM stories';
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY created_at DESC';

  const offset = (page - 1) * limit;
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

function findById(id) {
  const stmt = db.prepare('SELECT * FROM stories WHERE id = ?');
  return stmt.get(id);
}

function update(id, data) {
  const now = new Date().toISOString();
  const fields = [];
  const params = [];

  const allowedFields = ['title', 'author', 'genre', 'description', 'content', 'duration', 'cover_image', 'audio_url'];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push('updated_at = ?');
  params.push(now);
  params.push(id);

  const stmt = db.prepare(`UPDATE stories SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...params);

  return findById(id);
}

function remove(id) {
  const stmt = db.prepare('DELETE FROM stories WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

function findByGenre(genre) {
  const stmt = db.prepare('SELECT * FROM stories WHERE genre = ? ORDER BY created_at DESC');
  return stmt.all(genre);
}

function getGenres() {
  const stmt = db.prepare('SELECT DISTINCT genre FROM stories WHERE genre IS NOT NULL ORDER BY genre');
  return stmt.all().map((row) => row.genre);
}

module.exports = { create, findAll, findById, update, remove, findByGenre, getGenres };
