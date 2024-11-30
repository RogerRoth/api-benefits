import { HttpException, HttpStatus } from '@nestjs/common';

export class RedisConnectionException extends HttpException {
  constructor(originalError: string) {
    super(
      `Failed to connect to Redis: ${originalError}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
