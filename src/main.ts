import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './env/env.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppLoggerService } from './utils/logger/app-logger.service';
import { AllExceptionsFilter } from './utils/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new AppLoggerService(), // Usa o LoggerService customizado
  });
  const logger = app.get(AppLoggerService);

  const envService = app.get(EnvService);
  const port = envService.get('PORT');

  const heartbeatInterval = Number(
    envService.get('RABBITMQ_HEARTBEAT_INTERVAL_IN_SECONDS'),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [envService.get('RABBITMQ_URL')],
      queue: envService.get('RABBITMQ_QUEUE'),
      queueOptions: {
        durable: true,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: heartbeatInterval,
      },
    },
  });

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  await app.startAllMicroservices();

  await app.listen(port);
}
bootstrap();
