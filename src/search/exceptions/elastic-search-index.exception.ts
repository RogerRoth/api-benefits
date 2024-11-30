import { HttpException, HttpStatus } from '@nestjs/common';

export class ElasticSearchIndexException extends HttpException {
  constructor(indexName: string, originalError: string) {
    super(
      `Failed to index data in ElasticSearch index "${indexName}": ${originalError}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
