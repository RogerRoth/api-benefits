import { HttpException, HttpStatus } from '@nestjs/common';

export class ElasticSearchFetchException extends HttpException {
  constructor(indexName: string, indexSearch: string, originalError: string) {
    super(
      `Failed to fetch data from ElasticSearch index "${indexName}" for ID "${indexSearch}": ${originalError}`,
      HttpStatus.NOT_FOUND,
    );
  }
}
