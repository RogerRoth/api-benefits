import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import {
  FetchBenefitsQueryDTO,
  fetchBenefitsQueryDTOSchema,
} from './dtos/fetch-benefits-query.dto';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import { FetchBenefitsResponseDTO } from './dtos/fetch-benefits-response.dto';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(fetchBenefitsQueryDTOSchema))
  async getBenefits(
    @Query() query: FetchBenefitsQueryDTO,
  ): Promise<FetchBenefitsResponseDTO> {
    return await this.benefitsService.getBenefits(query);
  }
}

