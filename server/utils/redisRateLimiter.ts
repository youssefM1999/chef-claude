import Redis from 'ioredis';
import crypto from 'crypto';

const getRedisConfig = () => {
    const nodeEnv = process.env.NODE_ENV || 'development';

    if (nodeEnv === 'production') {
        return {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        }
    }

    return {
        url: 'redis://localhost:6379',
    }
}

const redis = new Redis(getRedisConfig().url);

export interface RateLimitResponse {
    allowed: boolean;
    remaining: number;
    reset: number;
}

export class RedisRateLimiter {
    constructor(
        private limit: number,
        private windowMs: number = 60 * 60 * 24 * 1000,
    ) {}
    async checkLimit(userId: string): Promise<RateLimitResponse> {
        const key = `rate_limit:recipes:${userId}`;
        const now = Date.now();
        const windowStart = now - this.windowMs;

        try {
            const pipeline = redis.pipeline();

            // Remove expired entries
            pipeline.zremrangebyscore(key, 0, windowStart);
            
            // Count current requests
            pipeline.zcard(key);
            
            const results = await pipeline.exec();
            const count = results?.[1]?.[1] as number || 0;

            if (count >= this.limit) {
                const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
                if (oldestRequest.length > 0) {
                    // oldestRequest[0] is the request ID, and oldestRequest[1] is the timestamp
                    const oldestTimestamp = parseInt(oldestRequest[1], 10);
                    const resetTime = oldestTimestamp + this.windowMs;

                    return {
                        allowed: false,
                        remaining: 0,
                        reset: resetTime,
                    }
                }
            }

            // Add current request since limit check passed
            const requestId = `${now}-${crypto.randomUUID()}`;
            await redis.zadd(key, now, requestId);
            
            // Set expiry of the entire key (24 hours)
            await redis.expire(key, Math.ceil(this.windowMs / 1000));

            return {
                allowed: true,
                remaining: this.limit - count - 1,
                reset: now + this.windowMs,
            };

        } catch (error) {
            console.error('Error checking rate limit:', error);
            return {
                allowed: true,
                remaining: this.limit,
                reset: now + this.windowMs,
            };
        }
    }
}

export const recipeRateLimiter = new RedisRateLimiter(parseInt(process.env.RATE_LIMIT_RECIPES || '10'), parseInt(process.env.RECIPE_RATE_LIMIT_WINDOW_MS || '86400000'));