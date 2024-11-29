import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FetchBenefitsResponseDTO } from 'src/benefits/dtos/fetch-benefits-response.dto';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  // async indexCPF(
  //   cpf: string,
  //   data: object,
  //   indexName: string,
  // ): Promise<object> {
  //   const id = cpf;

  //   return await this.elasticsearchService.index({
  //     index: indexName,
  //     id,
  //     body: data,
  //   });
  // }

  // async searchCPF(cpf: string, indexName: string): Promise<object | unknown> {
  //   const result = await this.elasticsearchService.search({
  //     index: indexName,
  //     query: {
  //       match: { cpf },
  //     },
  //   });

  //   if (result.hits.hits.length > 0) {
  //     return result.hits.hits[0]._source;
  //   }

  //   return null;
  // }

  async getDataByIndex(
    indexSearch: string,
    indexName: string,
  ): Promise<FetchBenefitsResponseDTO | null> {
    const result = await this.elasticsearchService.search({
      index: indexName,
      body: {
        query: {
          match: { indexSearch },
        },
      },
    });

    if (result.hits.hits.length > 0) {
      return result.hits.hits[0]._source;
    }

    return null;
  }

  async indexData(
    data: FetchBenefitsResponseDTO,
    indexName: string,
  ): Promise<string> {
    const result = await this.elasticsearchService.index({
      index: indexName,
      body: data,
    });
    return result._id;
  }
}

