import { HttpException, HttpStatus } from '@nestjs/common';

export class RabbitMQProcessingException extends HttpException {
  constructor(message: string, originalError: string) {
    super(
      `Failed to process message "${message}": ${originalError}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
