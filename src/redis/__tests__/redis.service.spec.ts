import { RedisService } from '../redis.service';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { createClient, RedisClientType } from 'redis';

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

describe('RedisService', () => {
  let redisService: RedisService;
  let mockEnvService: { get: Mock };
  let mockRedisClient: Partial<RedisClientType>;

  beforeEach(() => {
    // Mock do EnvService
    mockEnvService = { get: vi.fn().mockReturnValue('redis://mock-url') };

    // Mock do cliente Redis
    mockRedisClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      set: vi.fn(),
    };

    // Mockando createClient para retornar o mock do Redis
    (vi.mocked(createClient) as Mock).mockReturnValue(
      mockRedisClient as RedisClientType,
    );

    // Instância do RedisService
    redisService = new RedisService(mockEnvService as any);
  });

  it('should connect to Redis on initialization', () => {
    expect(mockRedisClient.connect).toHaveBeenCalled();
  });

  it('should retrieve a value by key', async () => {
    const key = 'test-key';
    const value = 'test-value';

    (mockRedisClient.get as Mock).mockResolvedValue(value);

    const result = await redisService.get(key);
    expect(result).toBe(value);
    expect(mockRedisClient.get).toHaveBeenCalledWith(key);
  });

  it('should throw RedisOperationException when get fails', async () => {
    const error = new Error('RedisOperationException');
    (mockRedisClient.get as Mock).mockRejectedValue(error);

    await expect(redisService.get('invalid-key')).rejects.toThrowError(
      'RedisOperationException',
    );
  });

  it('should set a key with a value and TTL', async () => {
    const key = 'test-key';
    const value = 'test-value';
    const ttl = 1000;

    await redisService.set(key, value, ttl);

    expect(mockRedisClient.set).toHaveBeenCalledWith(key, value, { EX: ttl });
  });

  it('should throw RedisOperationException when set fails', async () => {
    const error = new Error('RedisOperationException');
    (mockRedisClient.set as Mock).mockRejectedValue(error);

    await expect(redisService.set('key', 'value')).rejects.toThrowError(
      'RedisOperationException',
    );
  });
});
