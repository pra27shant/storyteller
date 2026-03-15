const request = require('supertest');

// Set env before importing app
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const app = require('../src/server');
const db = require('../src/config/database');
const { parseCommand } = require('../src/services/voiceProcessor');

let authToken;

beforeEach(async () => {
  // Clear tables before each test
  db.exec('DELETE FROM listening_history');
  db.exec('DELETE FROM user_preferences');
  db.exec('DELETE FROM stories');
  db.exec('DELETE FROM users');

  // Create a test user and get token
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'voice@example.com', password: 'password123', name: 'Voice User' });

  authToken = res.body.token;
});

afterAll(() => {
  db.close();
});

describe('Voice Processor - parseCommand', () => {
  it('should parse "play something in fantasy" as play_genre', () => {
    const result = parseCommand('play something in fantasy');
    expect(result.action).toBe('play_genre');
    expect(result.params.genre).toBe('fantasy');
  });

  it('should parse "pause" as pause action', () => {
    const result = parseCommand('pause');
    expect(result.action).toBe('pause');
  });

  it('should parse "search for dragons" as search action', () => {
    const result = parseCommand('search for dragons');
    expect(result.action).toBe('search');
    expect(result.params.query).toBe('dragons');
  });

  it('should parse "resume" as resume action', () => {
    const result = parseCommand('resume');
    expect(result.action).toBe('resume');
  });

  it('should parse "stop" as stop action', () => {
    const result = parseCommand('stop');
    expect(result.action).toBe('stop');
  });

  it('should parse "skip" as skip action', () => {
    const result = parseCommand('skip');
    expect(result.action).toBe('skip');
  });

  it('should parse "repeat" as repeat action', () => {
    const result = parseCommand('repeat');
    expect(result.action).toBe('repeat');
  });

  it('should parse "play The Dragon Tale" as play action', () => {
    const result = parseCommand('play The Dragon Tale');
    expect(result.action).toBe('play');
    expect(result.params.query).toBe('the dragon tale');
  });

  it('should return unknown for unrecognized commands', () => {
    const result = parseCommand('do something weird');
    expect(result.action).toBe('unknown');
  });
});

describe('Voice Routes', () => {
  describe('POST /api/voice/command', () => {
    it('should process a voice command with auth', async () => {
      const res = await request(app)
        .post('/api/voice/command')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'play something in fantasy' });

      expect(res.status).toBe(200);
      expect(res.body.action).toBe('play_genre');
      expect(res.body.params.genre).toBe('fantasy');
      expect(res.body.response).toBeDefined();
    });

    it('should return 401 without auth', async () => {
      const res = await request(app)
        .post('/api/voice/command')
        .send({ text: 'pause' });

      expect(res.status).toBe(401);
    });

    it('should return 400 without text', async () => {
      const res = await request(app)
        .post('/api/voice/command')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/voice/tts', () => {
    it('should return placeholder audio URL', async () => {
      const res = await request(app)
        .post('/api/voice/tts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Once upon a time' });

      expect(res.status).toBe(200);
      expect(res.body.audio_url).toBeDefined();
      expect(res.body.message).toContain('placeholder');
    });
  });

  describe('POST /api/voice/stt', () => {
    it('should return placeholder transcription', async () => {
      const res = await request(app)
        .post('/api/voice/stt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ audio_data: 'base64-encoded-audio-data' });

      expect(res.status).toBe(200);
      expect(res.body.text).toBeDefined();
      expect(res.body.message).toContain('placeholder');
    });
  });
});
