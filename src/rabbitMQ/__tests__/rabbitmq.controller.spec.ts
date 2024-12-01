import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RabbitMQController } from '../rabbitmq.controller';

describe('RabbitMQController', () => {
  let rabbitMQController: RabbitMQController;

  const mockRabbitMQService = {
    processCPF: vi.fn(),
  };

  beforeEach(() => {
    rabbitMQController = new RabbitMQController(mockRabbitMQService as any);
  });

  it('should call RabbitMQService.processCPF when handleMessage is invoked', async () => {
    const mockMessage = { cpf: '12345678901', indexName: 'testIndex' };

    await rabbitMQController.handleMessage(mockMessage);

    expect(mockRabbitMQService.processCPF).toHaveBeenCalledWith(mockMessage);
  });
});
