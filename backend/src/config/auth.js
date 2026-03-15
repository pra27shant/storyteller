if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'storyteller-default-secret-change-in-production',
  tokenExpiration: '24h',
};

module.exports = authConfig;
