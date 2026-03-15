const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const SALT_ROUNDS = 10;

function create(email, password, name) {
  const id = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
  const now = new Date().toISOString();

  const stmt = db.prepare(
    'INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(id, email, hashedPassword, name, now, now);

  return { id, email, name, created_at: now, updated_at: now };
}

function findByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

function findById(id) {
  const stmt = db.prepare('SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?');
  return stmt.get(id);
}

function verifyPassword(plaintext, hash) {
  return bcrypt.compareSync(plaintext, hash);
}

module.exports = { create, findByEmail, findById, verifyPassword };
