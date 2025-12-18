// During tests we don't want to connect to production Redis — export a lightweight
// in-memory mock that implements the minimal async methods used by the app.
if (process.env.NODE_ENV === 'test') {
    const store = new Map();
    const mock = {
        async set(key, value, ...args) {
            // support EX or PX args by storing value and ignoring expiry in tests
            store.set(key, value);
            return 'OK';
        },
        async get(key) {
            return store.get(key) ?? null;
        },
        async del(key) {
            return store.delete(key) ? 1 : 0;
        },
        on() {},
        quit: async () => {},
    };

    module.exports = mock;
} else {
    const { Redis } = require('ioredis');

    const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
    });

    redis.on('connect', () => {
        console.log('Connected to Redis');
    });

    module.exports = redis;
}