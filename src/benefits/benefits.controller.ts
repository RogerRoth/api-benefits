import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import {
  FetchBenefitsQueryDTO,
  fetchBenefitsQueryDTOSchema,
} from './dtos/fetch-benefits-query.dto';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(fetchBenefitsQueryDTOSchema))
  async getBenefits(@Query() query: FetchBenefitsQueryDTO): Promise<string> {
    return await this.benefitsService.getHello(query);
  }
}

