import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function testRedis() {
    try {
        const pong = await redis.ping();
        console.log('✅ Redis is connected:', pong);
        // Test basic operations
        await redis.set('test', 'Hello, Redis!');
        const value = await redis.get('test');
        console.log('✅ Retrieved value:', value);

        await redis.del('test');
        console.log('✅ Test key deleted');

        await redis.disconnect();
        console.log('✅ Redis connection closed');
        
    } catch (error) {
        console.error('❌ Redis connection error:', error);
    }
}

testRedis();
