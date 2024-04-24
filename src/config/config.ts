// NOTE: Importing this will cache it and won't be reloaded on subsequent imports
export default () => ({
  redis: {
    host: 'localhost',
    port: 6379,
    enabled: false,
  },
  cache: {
    ttlInMilliseconds: 20 * 1000,
  },
  terminus: {
    heapUsedThreshold: 300 * 1024 * 1024,
    rssThreshold: 300 * 1024 * 1024,
    storageThresholdPercent: 0.9,
  },
  db: {
    // host: process.env.DBHOST,
    // port: process.env.DBPORT,
    // user: process.env.DBUSER,
    // pwd: process.env.DBPWD,
    pool: {
      max: 5,
      min: 0,
      idle: 15 * 1000,
      acquireTimeout: 30 * 1000,
    },
  },
});
