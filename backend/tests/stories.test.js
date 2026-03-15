const request = require('supertest');

// Set env before importing app
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const app = require('../src/server');
const db = require('../src/config/database');

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
    .send({ email: 'story@example.com', password: 'password123', name: 'Story User' });

  authToken = res.body.token;
});

afterAll(() => {
  db.close();
});

describe('Stories Routes', () => {
  describe('POST /api/stories', () => {
    it('should create a story when authenticated', async () => {
      const res = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'The Dragon Tale',
          author: 'J.R.R. Test',
          genre: 'fantasy',
          description: 'A tale about dragons',
          content: 'Once upon a time...',
          duration: 300,
        });

      expect(res.status).toBe(201);
      expect(res.body.story).toBeDefined();
      expect(res.body.story.title).toBe('The Dragon Tale');
      expect(res.body.story.id).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/stories')
        .send({ title: 'Unauthorized Story' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/stories', () => {
    beforeEach(async () => {
      // Seed some stories
      await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Fantasy Story', genre: 'fantasy', author: 'Author A' });

      await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Sci-Fi Story', genre: 'sci-fi', author: 'Author B' });

      await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Another Fantasy', genre: 'fantasy', author: 'Author C' });
    });

    it('should list all stories', async () => {
      const res = await request(app).get('/api/stories');

      expect(res.status).toBe(200);
      expect(res.body.stories).toBeDefined();
      expect(Array.isArray(res.body.stories)).toBe(true);
      expect(res.body.stories.length).toBe(3);
    });

    it('should filter stories by genre', async () => {
      const res = await request(app).get('/api/stories?genre=fantasy');

      expect(res.status).toBe(200);
      expect(res.body.stories.length).toBe(2);
      expect(res.body.stories.every((s) => s.genre === 'fantasy')).toBe(true);
    });
  });

  describe('GET /api/stories/:id', () => {
    it('should get a story by id', async () => {
      const createRes = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Specific Story', genre: 'mystery' });

      const storyId = createRes.body.story.id;

      const res = await request(app).get(`/api/stories/${storyId}`);

      expect(res.status).toBe(200);
      expect(res.body.story).toBeDefined();
      expect(res.body.story.title).toBe('Specific Story');
    });

    it('should return 404 for non-existent story', async () => {
      const res = await request(app).get('/api/stories/non-existent-id');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/stories/:id', () => {
    it('should update a story when authenticated', async () => {
      const createRes = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Original Title', genre: 'horror' });

      const storyId = createRes.body.story.id;

      const res = await request(app)
        .put(`/api/stories/${storyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.story.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/stories/:id', () => {
    it('should delete a story when authenticated', async () => {
      const createRes = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'To Delete', genre: 'drama' });

      const storyId = createRes.body.story.id;

      const res = await request(app)
        .delete(`/api/stories/${storyId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();

      // Verify it's gone
      const getRes = await request(app).get(`/api/stories/${storyId}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('GET /api/stories/genres', () => {
    it('should return list of genres', async () => {
      await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Story 1', genre: 'fantasy' });

      await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Story 2', genre: 'sci-fi' });

      const res = await request(app).get('/api/stories/genres');

      expect(res.status).toBe(200);
      expect(res.body.genres).toBeDefined();
      expect(Array.isArray(res.body.genres)).toBe(true);
      expect(res.body.genres).toContain('fantasy');
      expect(res.body.genres).toContain('sci-fi');
    });
  });
});
