import { describe, it, beforeEach, expect, vi } from 'vitest';
import { SearchService } from '../search.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticSearchFetchException } from '../exceptions/elastic-search-fetch.exception';
import { ElasticSearchIndexException } from '../exceptions/elastic-search-index.exception';
import { fetchBenefitsResponseDTOSchema } from 'src/benefits/dtos/fetch-benefits-response.dto';

vi.mock('@nestjs/elasticsearch', () => ({
  ElasticsearchService: vi.fn(() => ({
    search: vi.fn(),
    index: vi.fn(),
  })),
}));

describe('SearchService', () => {
  let searchService: SearchService;
  let elasticsearchServiceMock: {
    search: ReturnType<typeof vi.fn>;
    index: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    elasticsearchServiceMock = new ElasticsearchService({
      node: 'http://localhost:9200',
    }) as any;
    searchService = new SearchService(elasticsearchServiceMock as any);
  });

  describe('getDataByIndex', () => {
    it('should return data if a match is found', async () => {
      const mockResponse = {
        hits: {
          hits: [{ _source: { id: '123', name: 'Test Benefit' } }],
        },
      };

      elasticsearchServiceMock.search.mockResolvedValue(mockResponse);

      const result = await searchService.getDataByIndex('123', 'benefits');
      expect(result).toEqual({ id: '123', name: 'Test Benefit' });
      expect(elasticsearchServiceMock.search).toHaveBeenCalledWith({
        index: 'benefits',
        body: { query: { match: { _id: '123' } } },
      });
    });

    it('should return null if no match is found', async () => {
      elasticsearchServiceMock.search.mockResolvedValue({
        hits: { hits: [] },
      });

      const result = await searchService.getDataByIndex('123', 'benefits');
      expect(result).toBeNull();
    });

    it('should throw ElasticSearchFetchException on error', async () => {
      const error = new Error('Search error');
      elasticsearchServiceMock.search.mockRejectedValue(error);

      await expect(
        searchService.getDataByIndex('123', 'benefits'),
      ).rejects.toThrowError(
        new ElasticSearchFetchException('benefits', '123', error.message),
      );
    });
  });

  describe('indexData', () => {
    it('should index data and return the ID', async () => {
      const mockResponse = { _id: 'generated-id' };
      elasticsearchServiceMock.index.mockResolvedValue(mockResponse);

      const data = {
        cpf: '12345678901',
        beneficios: [
          {
            numero_beneficio: '123123123',
            codigo_tipo_beneficio: '3',
          },
        ],
      };

      const dataDto = fetchBenefitsResponseDTOSchema.parse(data);

      const result = await searchService.indexData(dataDto, 'benefits');

      expect(result).toBe('generated-id');
      expect(elasticsearchServiceMock.index).toHaveBeenCalledWith({
        index: 'benefits',
        body: dataDto,
      });
    });

    it('should throw ElasticSearchIndexException on error', async () => {
      const error = new Error('Index error');
      elasticsearchServiceMock.index.mockRejectedValue(error);

      const data = {
        cpf: '12345678901',
        beneficios: [
          {
            numero_beneficio: '123123123',
            codigo_tipo_beneficio: '3',
          },
        ],
      };

      const dataDto = fetchBenefitsResponseDTOSchema.parse(data);

      await expect(
        searchService.indexData(dataDto, 'benefits'),
      ).rejects.toThrowError(
        new ElasticSearchIndexException('benefits', error.message),
      );
    });
  });
});
