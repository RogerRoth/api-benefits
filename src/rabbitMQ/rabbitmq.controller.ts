import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { QueueMessageType } from 'src/shared/queue-message.type';

@Controller()
export class RabbitMQController {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  @EventPattern('cpf_queue')
  handleMessage(@Payload() message: QueueMessageType) {
    return this.rabbitMQService.processCPF(message);
  }
}

