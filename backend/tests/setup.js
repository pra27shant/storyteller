const path = require('path');

// Set test database to in-memory before any other imports
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
