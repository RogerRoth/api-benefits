import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RabbitMQService } from '../rabbitmq.service';
import { RabbitMQEnqueueException } from '../exceptions/rabbitmq-enqueue.exception';
import { FetchBenefitsResponseDTO } from 'src/benefits/dtos/fetch-benefits-response.dto';

describe('RabbitMQService', () => {
  let rabbitMQService: RabbitMQService;

  const mockClient = {
    send: vi.fn(),
  };

  const mockRedisService = {
    get: vi.fn(),
    set: vi.fn(),
  };

  const mockSearchService = {
    indexData: vi.fn(),
  };

  const mockEnvService = {
    get: vi.fn().mockImplementation((key: string) => {
      if (key === 'RABBITMQ_QUEUE') return 'mockQueue';
      return null;
    }),
  };

  const mockLogger = {
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    rabbitMQService = new RabbitMQService(
      mockClient as any,
      mockRedisService as any,
      mockSearchService as any,
      mockEnvService as any,
      {} as any,
      {} as any,
      mockLogger as any,
    );
    rabbitMQService.onModuleInit();
  });

  it('should enqueue a message successfully', async () => {
    mockClient.send.mockReturnValue({
      subscribe: vi.fn((callbacks) => callbacks.next?.()),
    });

    const message = { cpf: '12345678901', indexName: 'testIndex' };
    await expect(rabbitMQService.enqueueCpf(message)).resolves.not.toThrow();

    expect(mockClient.send).toHaveBeenCalledWith('mockQueue', message);
  });

  it('should throw RabbitMQEnqueueException on error', async () => {
    mockClient.send.mockReturnValue({
      subscribe: vi.fn((callbacks) =>
        callbacks.error?.(new Error('Test Error')),
      ),
    });

    const message = { cpf: '12345678901', indexName: 'testIndex' };

    await expect(rabbitMQService.enqueueCpf(message)).rejects.toThrow(
      RabbitMQEnqueueException,
    );
  });

  it('should process CPF and set redis deduplication', async () => {
    const mockMessage = { cpf: '12345678901', indexName: 'testIndex' };

    mockRedisService.get.mockResolvedValue(null);
    mockSearchService.indexData.mockResolvedValue('mockIndex');

    const data: FetchBenefitsResponseDTO = {
      cpf: '12345678900',
      beneficios: [
        {
          numero_beneficio: '1794290989',
          codigo_tipo_beneficio: '01',
        },
      ],
    };

    vi.spyOn(rabbitMQService, 'getBenefitsUser').mockResolvedValue(data);

    await rabbitMQService.processCPF(mockMessage);

    expect(mockRedisService.set).toHaveBeenCalledWith(
      `deduplication-${mockMessage.cpf}`,
      'processed',
      300,
    );
    expect(mockRedisService.set).toHaveBeenCalledWith(
      mockMessage.cpf,
      'mockIndex',
    );
  });
});
