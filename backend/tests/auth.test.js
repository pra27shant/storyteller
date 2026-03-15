const request = require('supertest');

// Set env before importing app
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const app = require('../src/server');
const db = require('../src/config/database');

beforeEach(() => {
  // Clear tables before each test
  db.exec('DELETE FROM listening_history');
  db.exec('DELETE FROM user_preferences');
  db.exec('DELETE FROM stories');
  db.exec('DELETE FROM users');
});

afterAll(() => {
  db.close();
});

describe('Auth Routes', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should return 409 for duplicate email', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({ email: 'dup@example.com', password: 'password123', name: 'User One' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'dup@example.com', password: 'password456', name: 'User Two' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'not-an-email', password: 'password123', name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({ email: 'login@example.com', password: 'password123', name: 'Login User' });
    });

    it('should login with valid credentials and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'me@example.com', password: 'password123', name: 'Me User' });

      const token = signupRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('me@example.com');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
  });
});
