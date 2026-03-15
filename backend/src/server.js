const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const userRoutes = require('./routes/users');
const voiceRoutes = require('./routes/voice');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(limiter);
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/voice', voiceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Storyteller server running on port ${PORT}`);
  });
}

module.exports = app;
