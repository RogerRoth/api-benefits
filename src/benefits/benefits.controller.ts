import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
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
    @Res() res: Response,
  ): Promise<FetchBenefitsResponseDTO | object> {
    const data = await this.benefitsService.getBenefits(query);

    if (data) {
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data,
      });
    }

    return res.status(HttpStatus.ACCEPTED).json({
      statusCode: HttpStatus.ACCEPTED,
      message:
        'Busca em processamento. Por favor, verifique novamente em alguns instantes.',
    });
  }
}
