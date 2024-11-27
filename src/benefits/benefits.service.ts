import { Injectable } from '@nestjs/common';
import { FetchBenefitsQueryDTO } from './dtos/fetch-benefits-query.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class BenefitsService {
  constructor(private readonly authService: AuthService) {}

  async getHello(query: FetchBenefitsQueryDTO): Promise<string> {
    const jwt = await this.authService.getToken();

    const { cpf } = query;
    return `CPF: ${cpf}, ${jwt}`;
  }
}
