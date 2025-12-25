import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { cache, CacheKeys, fetchWithCache } from '@/lib/utils/cache';

describe('Cache Utilities', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('cache.set and cache.get', () => {
    it('should set and get cached data', () => {
      cache.set('test-key', { data: 'test' });
      const result = cache.get('test-key');
      expect(result).toEqual({ data: 'test' });
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return null for expired entry', async () => {
      cache.set('expired-key', { data: 'test' }, 100); // 100ms TTL
      await new Promise(resolve => setTimeout(resolve, 150));
      const result = cache.get('expired-key');
      expect(result).toBeNull();
    });
  });

  describe('cache.has', () => {
    it('should return true for existing key', () => {
      cache.set('test-key', { data: 'test' });
      expect(cache.has('test-key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should return false for expired entry', async () => {
      cache.set('expired-key', { data: 'test' }, 100);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.has('expired-key')).toBe(false);
    });
  });

  describe('cache.delete', () => {
    it('should delete cached entry', () => {
      cache.set('test-key', { data: 'test' });
      cache.delete('test-key');
      expect(cache.get('test-key')).toBeNull();
    });
  });

  describe('cache.clear', () => {
    it('should clear all cached entries', () => {
      cache.set('key1', { data: 'test1' });
      cache.set('key2', { data: 'test2' });
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('fetchWithCache', () => {
    it('should fetch and cache data', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });
      const result = await fetchWithCache('test-key', fetcher);
      
      expect(result).toEqual({ data: 'test' });
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(cache.get('test-key')).toEqual({ data: 'test' });
    });

    it('should return cached data on second call', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });
      
      await fetchWithCache('test-key', fetcher);
      const result = await fetchWithCache('test-key', fetcher);
      
      expect(result).toEqual({ data: 'test' });
      expect(fetcher).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it('should fetch again after cache expires', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });
      
      await fetchWithCache('test-key', fetcher, 100);
      await new Promise(resolve => setTimeout(resolve, 150));
      await fetchWithCache('test-key', fetcher, 100);
      
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });

  describe('CacheKeys', () => {
    it('should have all required cache keys', () => {
      expect(CacheKeys.TEMPLATES).toBe('templates');
      expect(CacheKeys.FEATURED_TEMPLATES).toBe('featured_templates');
      expect(CacheKeys.LEGACY_PROJECTS).toBe('legacy_projects');
      expect(CacheKeys.TEMPLATE_DETAIL('test-slug')).toBe('template:test-slug');
    });
  });
});

