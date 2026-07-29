import { Redis } from "@upstash/redis";

// Extract environment variables
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Graceful fallback dummy cache for local environments without Redis configured
class DummyRedis {
  async get(key: string) { return null; }
  async set(key: string, value: any, options?: any) { return "OK"; }
  async del(key: string) { return 1; }
}

export const redis = UPSTASH_URL && UPSTASH_TOKEN 
  ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN })
  : (new DummyRedis() as unknown as Redis);

export const hasRedis = !!(UPSTASH_URL && UPSTASH_TOKEN);
