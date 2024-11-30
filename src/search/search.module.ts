import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { EnvModule } from 'src/env/env.module';
import { EnvService } from 'src/env/env.service';

@Module({
  imports: [
    EnvModule,
    ElasticsearchModule.registerAsync({
      imports: [EnvModule],
      useFactory: async (envService: EnvService) => ({
        node: envService.get('ELASTIC_SEARCH_URL'),
        auth: {
          username: envService.get('ELASTIC_SEARCH_USERNAME'),
          password: envService.get('ELASTIC_SEARCH_PASSWORD'),
        },
      }),
      inject: [EnvService],
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
