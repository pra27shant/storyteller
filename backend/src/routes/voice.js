const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { parseCommand, generateResponse } = require('../services/voiceProcessor');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/command',
  [body('text').notEmpty().withMessage('Voice command text is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { text } = req.body;
      const intent = parseCommand(text);
      const response = generateResponse(intent.action, intent.params);

      res.json({
        action: intent.action,
        params: intent.params,
        response,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process voice command' });
    }
  }
);

// Text-to-speech stub endpoint
// NOTE: Real implementation requires a TTS API key (e.g., Google Cloud TTS, Amazon Polly, or ElevenLabs)
router.post(
  '/tts',
  [body('text').notEmpty().withMessage('Text is required for speech synthesis')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;

    res.json({
      audio_url: `https://api.placeholder.tts/audio/${encodeURIComponent(text.substring(0, 50))}`,
      format: 'mp3',
      duration_estimate: Math.ceil(text.split(' ').length / 2.5),
      message: 'This is a placeholder. Integrate a real TTS API (Google Cloud TTS, Amazon Polly, ElevenLabs) for production use.',
    });
  }
);

// Speech-to-text stub endpoint
// NOTE: Real implementation requires an STT API key (e.g., Google Cloud Speech, AWS Transcribe, or Whisper)
router.post(
  '/stt',
  [body('audio_data').notEmpty().withMessage('Audio data description is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    res.json({
      text: 'play something in fantasy',
      confidence: 0.95,
      message: 'This is a placeholder. Integrate a real STT API (Google Cloud Speech, AWS Transcribe, Whisper) for production use.',
    });
  }
);

module.exports = router;
