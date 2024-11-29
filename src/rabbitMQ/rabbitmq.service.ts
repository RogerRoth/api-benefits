import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { Payload, ClientProxy } from '@nestjs/microservices';
import { EnvService } from 'src/env/env.service';
import { RedisService } from 'src/redis/redis.service';
import { QueueMessageType } from 'src/shared/queue-message.type';
import {
  FetchBenefitsResponseDTO,
  fetchBenefitsResponseDTOSchema,
} from 'src/benefits/dtos/fetch-benefits-response.dto';
import { AuthService } from 'src/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

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
  ) {}

  async onModuleInit() {
    this.queueName = this.envService.get('RABBITMQ_QUEUE');

    console.log('RabbitMQ module initialized');
  }

  async enqueueCpf(message: QueueMessageType): Promise<void> {
    this.client.send(this.queueName, message).subscribe({
      next: () => console.log(`Mensagem ${message} enviado para a fila`),
      error: (error) => console.error('Erro ao enfileirar Mensagem:', error),
    });
  }

  async processCPF(@Payload() message: QueueMessageType) {
    console.log(`processCPF iniciado`);

    const { cpf, indexName } = message;

    const deduplication = await this.redisService.get(`deduplication-${cpf}`);

    if (deduplication == 'processed') {
      console.log(`Mensagem duplicada ignorada: ${cpf}`);
      return;
    }
    await this.redisService.set(`deduplication-${cpf}`, 'processed');

    try {
      const benefits = await this.getBenefitsUser(cpf);

      const index = await this.searchService.indexData(benefits, indexName);
      await this.redisService.set(cpf, index);
    } catch (error) {
      await this.redisService.set(`deduplication-${cpf}`, 'error');
      console.error('Erro ao processar CPF:', error);
    }
  }

  private async getBenefitsUser(
    cpf: string,
  ): Promise<FetchBenefitsResponseDTO> {
    const baseUrl = this.envService.get('KONSI_BASE_URL');
    const url = `${baseUrl}/api/v1/inss/consulta-beneficios?cpf=${cpf}`;
    const jwt = await this.authService.getToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: jwt,
          },
        }),
      );

      const data = response.data.data;
      return fetchBenefitsResponseDTOSchema.parse(data);
    } catch (error) {
      console.error('Error fetching user benefits:', error.message);
      throw new Error(`Failed to fetch user benefits: ${error.message}`);
    }
  }
}

