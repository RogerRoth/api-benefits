import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class AuthService {
  private token: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly envService: EnvService,
  ) {}

  private async fetchToken(): Promise<void> {
    const baseUrl = this.envService.get('KONSI_BASE_URL');
    const url = `${baseUrl}/api/v1/token`;
    const credentials = {
      username: this.envService.get('KONSI_AUTH_USER'),
      password: this.envService.get('KONSI_AUTH_PASSWORD'),
    };

    return firstValueFrom(this.httpService.post(url, credentials))
      .then((response) => {
        console.log('Token response:', response.data);
        this.token = response.data.data.token;
        this.tokenExpiresAt = new Date(Date.now() + 3600 * 500);
      })
      .catch((error) => {
        console.error('Error fetching token:', error.message);
        throw new Error(`Failed to generate token: ${error.message}`);
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

