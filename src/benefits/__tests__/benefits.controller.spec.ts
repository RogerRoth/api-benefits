import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BenefitsService } from '../benefits.service';
import { BenefitsController } from '../benefits.controller';
import { FetchBenefitsQueryDTO } from '../dtos/fetch-benefits-query.dto';
import { HttpStatus } from '@nestjs/common';

const mockRedisService = {
  get: vi.fn(),
};

const mockSearchService = {
  getDataByIndex: vi.fn(),
};

const mockRabbitMQService = {
  enqueueCpf: vi.fn(),
};

describe('BenefitsController', () => {
  let benefitsService: BenefitsService;
  let benefitsController: BenefitsController;

  beforeEach(() => {
    benefitsService = new BenefitsService(
      mockSearchService as any,
      mockRedisService as any,
      mockRabbitMQService as any,
    );

    benefitsController = new BenefitsController(benefitsService);
  });

  it('should return benefits when data is found in Redis and SearchService', async () => {
    const mockQuery: FetchBenefitsQueryDTO = { cpf: '12345678901' };
    const mockBenefits = { benefits: ['Benefit A', 'Benefit B'] };

    mockRedisService.get.mockResolvedValue('mockIndex');
    mockSearchService.getDataByIndex.mockResolvedValue(mockBenefits);

    const result = await benefitsController.getBenefits(mockQuery);

    expect(result).toEqual(mockBenefits);
    expect(mockRedisService.get).toHaveBeenCalledWith('12345678901');
    expect(mockSearchService.getDataByIndex).toHaveBeenCalledWith(
      'mockIndex',
      'benefits',
    );
    expect(mockRabbitMQService.enqueueCpf).not.toHaveBeenCalled();
  });

  it('should enqueue CPF in RabbitMQ when data is not found', async () => {
    const mockQuery: FetchBenefitsQueryDTO = { cpf: '12345678901' };

    mockRedisService.get.mockResolvedValue(null);

    const result = await benefitsController.getBenefits(mockQuery);

    expect(result).toEqual({
      statusCode: HttpStatus.ACCEPTED,
      message:
        'Busca em processamento. Por favor, verifique novamente em alguns instantes.',
    });
    expect(mockRedisService.get).toHaveBeenCalledWith('12345678901');
    expect(mockRabbitMQService.enqueueCpf).toHaveBeenCalledWith({
      cpf: '12345678901',
      indexName: 'benefits',
    });
  });

  it('should return an empty response when Redis has an index but no benefits are found', async () => {
    const mockQuery: FetchBenefitsQueryDTO = { cpf: '12345678901' };

    mockRedisService.get.mockResolvedValue('mockIndex');
    mockSearchService.getDataByIndex.mockResolvedValue(null);

    const result = await benefitsController.getBenefits(mockQuery);

    expect(result).toEqual({
      statusCode: HttpStatus.ACCEPTED,
      message:
        'Busca em processamento. Por favor, verifique novamente em alguns instantes.',
    });
    expect(mockRedisService.get).toHaveBeenCalledWith('12345678901');
    expect(mockSearchService.getDataByIndex).toHaveBeenCalledWith(
      'mockIndex',
      'benefits',
    );
    expect(mockRabbitMQService.enqueueCpf).toHaveBeenCalled();
  });
});
