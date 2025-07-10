import { kv } from '@vercel/kv';

/**
 * Common Redis/KV utility functions for the application
 * Uses Vercel KV which is powered by Upstash Redis
 */

export class CacheService {
  /**
   * Get a value from cache with type safety
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      return await kv.get<T>(key);
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  static async set<T>(
    key: string, 
    value: T, 
    ttlSeconds?: number
  ): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await kv.set(key, value, { ex: ttlSeconds });
      } else {
        await kv.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   */
  static async delete(key: string): Promise<boolean> {
    try {
      await kv.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if a key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await kv.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set multiple key-value pairs
   */
  static async mset(data: Record<string, unknown>): Promise<boolean> {
    try {
      const pipeline = kv.pipeline();
      Object.entries(data).forEach(([key, value]) => {
        pipeline.set(key, value);
      });
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache MSET error:', error);
      return false;
    }
  }

  /**
   * Get multiple values by keys
   */
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      return await kv.mget<T>(...keys);
    } catch (error) {
      console.error('Cache MGET error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Increment a numeric value
   */
  static async incr(key: string, increment = 1): Promise<number | null> {
    try {
      return await kv.incrby(key, increment);
    } catch (error) {
      console.error(`Cache INCR error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value with expiration time (for temporary data)
   */
  static async setTemp<T>(
    key: string, 
    value: T, 
    ttlSeconds: number
  ): Promise<boolean> {
    return this.set(key, value, ttlSeconds);
  }

  /**
   * Get remaining TTL for a key
   */
  static async ttl(key: string): Promise<number | null> {
    try {
      return await kv.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return null;
    }
  }
}

// Specific cache helpers for menu extraction
export class MenuExtractionCache {
  private static readonly PREFIX = 'extraction:';
  
  static async get<T = unknown>(menuId: string): Promise<T | null> {
    return CacheService.get<T>(`${this.PREFIX}${menuId}`);
  }

  static async set<T = unknown>(menuId: string, data: T, ttlSeconds?: number): Promise<boolean> {
    return CacheService.set(`${this.PREFIX}${menuId}`, data, ttlSeconds);
  }

  static async delete(menuId: string): Promise<boolean> {
    return CacheService.delete(`${this.PREFIX}${menuId}`);
  }

  static async exists(menuId: string): Promise<boolean> {
    return CacheService.exists(`${this.PREFIX}${menuId}`);
  }
}