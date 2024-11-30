import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { Payload, ClientProxy } from '@nestjs/microservices';
import { EnvService } from 'src/env/env.service';
import { RedisService } from 'src/redis/redis.service';
import {
  FetchBenefitsResponseDTO,
  fetchBenefitsResponseDTOSchema,
} from 'src/benefits/dtos/fetch-benefits-response.dto';
import { AuthService } from 'src/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AppLoggerService } from 'src/utils/logger/app-logger.service';
import { QueueMessageType } from './types/queue-message.type';
import { RabbitMQEnqueueException } from './exceptions/rabbitmq-enqueue.exception';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private queueName: string;

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly redisService: RedisService,
    private readonly searchService: SearchService,
    private readonly envService: EnvService,
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
    private readonly logger: AppLoggerService,
  ) {}

  async onModuleInit() {
    this.queueName = this.envService.get('RABBITMQ_QUEUE');
  }

  async enqueueCpf(message: QueueMessageType): Promise<void> {
    try {
      this.client.send(this.queueName, message).subscribe({
        error: (error) => {
          throw new RabbitMQEnqueueException(this.queueName, error.message);
        },
      });
    } catch (error) {
      throw new RabbitMQEnqueueException(this.queueName, error.message);
    }
  }

  async processCPF(@Payload() message: QueueMessageType) {
    const { cpf, indexName } = message;

    try {
      const deduplication = await this.redisService.get(`deduplication-${cpf}`);

      if (deduplication == 'processed') {
        this.logger.warn(`Duplicated message ignored CPF:"${cpf}"`);
        return;
      }
      await this.redisService.set(`deduplication-${cpf}`, 'processed');

      const benefits = await this.getBenefitsUser(cpf);

      const index = await this.searchService.indexData(benefits, indexName);
      await this.redisService.set(cpf, index);
    } catch (error) {
      await this.redisService.set(`deduplication-${cpf}`, 'error');

      this.logger.error(
        `Erro no processamento do CPF: ${cpf} - ${error.message}`,
      );
      return { success: false, message: error.message };
    }
  }

  private async getBenefitsUser(
    cpf: string,
  ): Promise<FetchBenefitsResponseDTO> {
    const baseUrl = this.envService.get('KONSI_BASE_URL');
    const url = `${baseUrl}/api/v1/inss/consulta-beneficios?cpf=${cpf}`;
    const jwt = await this.authService.getToken();

    let data = {
      cpf,
      beneficios: [],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: jwt,
          },
        }),
      );

      data = response.data.data;
    } catch (error) {
      this.logger.warn(`CPF not found:"${cpf}"`);
      return;
    } finally {
      return fetchBenefitsResponseDTOSchema.parse(data);
    }
  }
}
