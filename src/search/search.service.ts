import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FetchBenefitsResponseDTO } from 'src/benefits/dtos/fetch-benefits-response.dto';
import { ElasticSearchFetchException } from './exceptions/elastic-search-fetch.exception';
import { ElasticSearchIndexException } from './exceptions/elastic-search-index.exception';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getDataByIndex(
    indexSearch: string,
    indexName: string,
  ): Promise<FetchBenefitsResponseDTO | null> {
    try {
      const result = await this.elasticsearchService.search({
        index: indexName,
        body: {
          query: {
            match: { _id: indexSearch },
          },
        },
      });

      if (result.hits.hits.length > 0) {
        return result.hits.hits[0]._source;
      }

      return null;
    } catch (error) {
      throw new ElasticSearchFetchException(
        indexName,
        indexSearch,
        error.message,
      );
    }
  }

  async indexData(
    data: FetchBenefitsResponseDTO,
    indexName: string,
  ): Promise<string> {
    try {
      const result = await this.elasticsearchService.index({
        index: indexName,
        body: data,
      });
      return result._id;
    } catch (error) {
      throw new ElasticSearchIndexException(indexName, error.message);
    }
  }
}
