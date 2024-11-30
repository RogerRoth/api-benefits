import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private token: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly envService: EnvService,
  ) {}

  async onModuleInit() {
    await this.fetchToken();
  }

  private async fetchToken(): Promise<void> {
    const baseUrl = this.envService.get('KONSI_BASE_URL');
    const url = `${baseUrl}/api/v1/token`;
    const credentials = {
      username: this.envService.get('KONSI_AUTH_USER'),
      password: this.envService.get('KONSI_AUTH_PASSWORD'),
    };

    return firstValueFrom(this.httpService.post(url, credentials))
      .then((response) => {
        this.token = `${response.data.data.type} ${response.data.data.token}`;
        this.tokenExpiresAt = new Date(response.data.data.expiresIn);
      })
      .catch((error) => {
        throw new HttpException(
          `Failed to fetch token: ${error.message}`,
          error.statusCode,
        );
      });
  }

  async getToken(): Promise<string> {
    if (
      !this.token ||
      (this.tokenExpiresAt && new Date() > this.tokenExpiresAt)
    ) {
      return this.fetchToken().then(() => this.token!);
    }
    return Promise.resolve(this.token);
  }
}
