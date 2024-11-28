import { Injectable } from '@nestjs/common';
import { FetchBenefitsQueryDTO } from './dtos/fetch-benefits-query.dto';
import { AuthService } from 'src/auth/auth.service';
import { EnvService } from 'src/env/env.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  FetchBenefitsResponseDTO,
  fetchBenefitsResponseDTOSchema,
} from './dtos/fetch-benefits-response.dto';

@Injectable()
export class BenefitsService {
  constructor(
    private readonly authService: AuthService,
    private readonly envService: EnvService,
    private readonly httpService: HttpService,
  ) {}

  async getBenefits(
    query: FetchBenefitsQueryDTO,
  ): Promise<FetchBenefitsResponseDTO> {
    const { cpf } = query;

    const data = this.getBenefitsUser(cpf);

    return data;
  }

  async getBenefitsUser(cpf: string): Promise<FetchBenefitsResponseDTO> {
    const baseUrl = this.envService.get('KONSI_BASE_URL');
    const url = `${baseUrl}/api/v1/inss/consulta-beneficios?cpf=${cpf}`;
    const jwt = await this.authService.getToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: jwt,
          },
        }),
      );

      const data = response.data.data;
      return fetchBenefitsResponseDTOSchema.parse(data);
    } catch (error) {
      console.error('Error fetching user benefits:', error.message);
      throw new Error(`Failed to fetch user benefits: ${error.message}`);
    }
  }
}
