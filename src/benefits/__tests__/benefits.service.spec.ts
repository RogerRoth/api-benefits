import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BenefitsService } from '../benefits.service';

const mockRedisService = {
  get: vi.fn(),
};

const mockSearchService = {
  getDataByIndex: vi.fn(),
};

const mockRabbitMQService = {
  enqueueCpf: vi.fn(),
};

describe('BenefitsService', () => {
  let benefitsService: BenefitsService;

  beforeEach(() => {
    benefitsService = new BenefitsService(
      mockSearchService as any,
      mockRedisService as any,
      mockRabbitMQService as any,
    );
  });

  it('should return benefits if Redis and SearchService have data', async () => {
    const mockCpf = '12345678901';
    const mockBenefits = { benefits: ['Benefit A', 'Benefit B'] };

    mockRedisService.get.mockResolvedValue('mockIndex');
    mockSearchService.getDataByIndex.mockResolvedValue(mockBenefits);

    const result = await benefitsService.getBenefits({ cpf: mockCpf });

    expect(result).toEqual(mockBenefits);
    expect(mockRedisService.get).toHaveBeenCalledWith(mockCpf);
    expect(mockSearchService.getDataByIndex).toHaveBeenCalledWith(
      'mockIndex',
      'benefits',
    );
  });

  it('should enqueue CPF in RabbitMQ when Redis does not have an index', async () => {
    const mockCpf = '12345678901';

    mockRedisService.get.mockResolvedValue(null);

    const result = await benefitsService.getBenefits({ cpf: mockCpf });

    expect(result).toBeNull();
    expect(mockRedisService.get).toHaveBeenCalledWith(mockCpf);
    expect(mockRabbitMQService.enqueueCpf).toHaveBeenCalledWith({
      cpf: mockCpf,
      indexName: 'benefits',
    });
  });

  it('should return null when SearchService does not find data', async () => {
    const mockCpf = '12345678901';

    mockRedisService.get.mockResolvedValue('mockIndex');
    mockSearchService.getDataByIndex.mockResolvedValue(null);

    const result = await benefitsService.getBenefits({ cpf: mockCpf });

    expect(result).toBeNull();
    expect(mockRedisService.get).toHaveBeenCalledWith(mockCpf);
    expect(mockSearchService.getDataByIndex).toHaveBeenCalledWith(
      'mockIndex',
      'benefits',
    );
    expect(mockRabbitMQService.enqueueCpf).toHaveBeenCalled();
  });
});
