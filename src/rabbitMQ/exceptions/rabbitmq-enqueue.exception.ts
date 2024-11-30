import { HttpException, HttpStatus } from '@nestjs/common';

export class RabbitMQEnqueueException extends HttpException {
  constructor(queueName: string, originalError: string) {
    super(
      `Failed to enqueue message in RabbitMQ queue "${queueName}": ${originalError}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
