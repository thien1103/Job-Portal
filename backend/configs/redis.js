import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 20,
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000); // Reconnect delay
    }
}
);

redisClient.on('ready', () => {
    console.log('Connected to Upstash Redis via ioredis');
});

redisClient.on('reconnecting', () => {
    console.log('Reconnecting to Upstash Redis...');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

export default redisClient;