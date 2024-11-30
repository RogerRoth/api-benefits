import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class AppLoggerService extends ConsoleLogger {
  private getCallingContext(): string {
    const stack = new Error().stack;
    if (!stack) return 'UnknownContext';

    const stackLines = stack.split('\n');
    const callingLine = stackLines[3] || stackLines[stackLines.length - 1];
    if (!callingLine) return 'UnknownContext';
    const match = callingLine.match(/at (.+) \(/);
    return match ? match[1] : 'UnknownContext';
  }

  log(message: string, context?: string) {
    super.log(message, context || this.getCallingContext());
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || this.getCallingContext());
  }

  warn(message: string, context?: string) {
    super.warn(message, context || this.getCallingContext());
  }

  debug(message: string, context?: string) {
    super.debug(message, context || this.getCallingContext());
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context || this.getCallingContext());
  }
}
