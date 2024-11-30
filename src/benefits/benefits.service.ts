import { Injectable } from '@nestjs/common';
import { FetchBenefitsQueryDTO } from './dtos/fetch-benefits-query.dto';
import { FetchBenefitsResponseDTO } from './dtos/fetch-benefits-response.dto';
import { SearchService } from 'src/search/search.service';
import { RedisService } from 'src/redis/redis.service';
import { RabbitMQService } from 'src/rabbitMQ/rabbitmq.service';
import { QueueMessageType } from 'src/rabbitMQ/types/queue-message.type';

@Injectable()
export class BenefitsService {
  private indexName = 'benefits';

  constructor(
    private readonly searchService: SearchService,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async getBenefits(
    query: FetchBenefitsQueryDTO,
  ): Promise<FetchBenefitsResponseDTO | null> {
    const { cpf } = query;

    const index = await this.redisService.get(cpf);

    if (index) {
      const benefits = await this.searchService.getDataByIndex(
        index,
        this.indexName,
      );
      if (benefits) {
        return benefits;
      }
    }

    const message: QueueMessageType = {
      cpf,
      indexName: this.indexName,
    };

    await this.rabbitMQService.enqueueCpf(message);

    return null;
  }
}
