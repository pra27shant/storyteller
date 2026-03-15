const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Story = require('../models/Story');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const filters = {
      genre: req.query.genre,
      author: req.query.author,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const stories = Story.findAll(filters);
    res.json({ stories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

router.get('/genres', (req, res) => {
  try {
    const genres = Story.getGenres();
    res.json({ genres });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const story = Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

router.post(
  '/',
  authMiddleware,
  [body('title').notEmpty().withMessage('Title is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const story = Story.create(req.body);
      res.status(201).json({ story });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create story' });
    }
  }
);

router.put('/:id', authMiddleware, (req, res) => {
  try {
    const existing = Story.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = Story.update(req.params.id, req.body);
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update story' });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const existing = Story.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Story not found' });
    }

    Story.remove(req.params.id);
    res.json({ message: 'Story deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

module.exports = router;
