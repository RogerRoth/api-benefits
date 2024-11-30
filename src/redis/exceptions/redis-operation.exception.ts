import { HttpException, HttpStatus } from '@nestjs/common';

export class RedisOperationException extends HttpException {
  constructor(operation: string, key: string, originalError: string) {
    super(
      `Failed to ${operation} key "${key}" in Redis: ${originalError}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
