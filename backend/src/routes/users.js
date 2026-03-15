const express = require('express');
const { body, validationResult } = require('express-validator');
const Preference = require('../models/Preference');
const authMiddleware = require('../middleware/auth');
const { getRecommendations } = require('../services/recommendation');

const router = express.Router();

router.use(authMiddleware);

router.get('/preferences', (req, res) => {
  try {
    const prefs = Preference.getByUserId(req.user.id);
    res.json({ preferences: prefs || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

router.put(
  '/preferences',
  [
    body('favorite_genres')
      .optional()
      .isArray()
      .withMessage('favorite_genres must be an array'),
    body('preferred_narrator')
      .optional()
      .isString()
      .withMessage('preferred_narrator must be a string'),
    body('audio_speed')
      .optional()
      .isFloat({ min: 0.5, max: 3.0 })
      .withMessage('audio_speed must be between 0.5 and 3.0'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const prefs = Preference.upsert(req.user.id, req.body);
      res.json({ preferences: prefs });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  }
);

router.post(
  '/history',
  [
    body('story_id').notEmpty().withMessage('story_id is required'),
    body('progress')
      .notEmpty()
      .withMessage('progress is required')
      .isInt({ min: 0, max: 100 })
      .withMessage('progress must be an integer between 0 and 100'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { story_id, progress } = req.body;
      const entry = Preference.addToHistory(req.user.id, story_id, progress);
      res.status(201).json({ history: entry });
    } catch (err) {
      res.status(500).json({ error: 'Failed to record listening progress' });
    }
  }
);

router.get('/history', (req, res) => {
  try {
    const history = Preference.getHistory(req.user.id);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listening history' });
  }
});

router.get('/recommendations', (req, res) => {
  try {
    const recommendations = getRecommendations(req.user.id);
    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
