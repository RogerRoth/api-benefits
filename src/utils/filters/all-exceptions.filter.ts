import {
  Catch,
  HttpStatus,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '../logger/app-logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'An unexpected error occurred';

    const dynamicContext = this.getContextFromStack(exception.stack);

    if (status >= 500) {
      this.logger.error(
        `Server error: ${exception.message}`,
        exception.stack,
        dynamicContext,
      );
    } else {
      this.logger.warn(`Client error: ${exception.message}`, dynamicContext);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private getContextFromStack(stack: string): string {
    if (!stack) return 'UnknownContext';

    const stackLines = stack.split('\n');
    const callingLine = stackLines[3] || stackLines[stackLines.length - 1];
    if (!callingLine) return 'UnknownContext';
    const match = callingLine.match(/at (.+) \(/);
    return match ? match[1] : 'UnknownContext';
  }
}
