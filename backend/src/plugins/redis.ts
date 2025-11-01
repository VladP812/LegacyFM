import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import Redis from "ioredis";

// extend module interface for proper typing
declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

function redisDb(fastify: FastifyInstance, options: Object) {
    const redis = new Redis({
        host: '127.0.0.1',
        port: 6379,
    });
    fastify.decorate("redis", redis);
}

export default fastifyPlugin(redisDb);

