const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'storyteller-default-secret-change-in-production',
  tokenExpiration: '24h',
};

module.exports = authConfig;
