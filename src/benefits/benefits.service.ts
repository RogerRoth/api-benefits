import { Injectable } from '@nestjs/common';
import { FetchBenefitsQueryDTO } from './dtos/fetch-benefits-query.dto';

@Injectable()
export class BenefitsService {
  getHello(query: FetchBenefitsQueryDTO): string {
    const { cpf } = query;
    return `CPF: ${cpf}`;
  }
}
