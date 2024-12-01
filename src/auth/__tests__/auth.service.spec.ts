import { describe, it, beforeEach, expect, vi } from 'vitest';
import { AuthService } from '../auth.service';
import { HttpService } from '@nestjs/axios';
import { EnvService } from 'src/env/env.service';
import { of, throwError } from 'rxjs';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';

function getTokenMockResponse(
  type: string,
  token: string,
  expiresInMS: number,
): AxiosResponse {
  const mockResponse: AxiosResponse = {
    data: {
      data: {
        type,
        token,
        expiresIn: new Date(Date.now() + expiresInMS).toISOString(),
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/json',
    },
    config: {
      headers: {
        common: {},
        delete: {},
        get: {},
        head: {},
        post: {},
        put: {},
        patch: {},
      } as unknown as AxiosRequestHeaders,
    },
  };

  return mockResponse;
}

describe('AuthService', () => {
  let authService: AuthService;
  let httpService: HttpService;
  let envService: EnvService;

  beforeEach(() => {
    httpService = {
      post: vi.fn(),
    } as unknown as HttpService;

    envService = {
      get: vi.fn((key: string) => {
        const envMock = {
          KONSI_BASE_URL: 'https://mockapi.com',
          KONSI_AUTH_USER: 'testUser',
          KONSI_AUTH_PASSWORD: 'testPassword',
        };
        return envMock[key];
      }),
    } as unknown as EnvService;

    authService = new AuthService(httpService, envService);
  });

  it('should fetch token successfully', async () => {
    const mockResponse = getTokenMockResponse('Bearer', 'mockToken', 3600000);
    vi.mocked(httpService.post).mockReturnValueOnce(of(mockResponse));

    await authService['fetchToken']();

    expect(authService['token']).toBe('Bearer mockToken');
    expect(authService['tokenExpiresAt']).toEqual(
      new Date(mockResponse.data.data.expiresIn),
    );
  });

  it('should throw an exception if token fetching fails', async () => {
    vi.mocked(httpService.post).mockReturnValueOnce(
      throwError(() => new Error('API Error')),
    );

    await expect(authService['fetchToken']()).rejects.toThrow(
      'Failed to fetch token: API Error',
    );
  });

  it('should return token if it is valid', async () => {
    authService['token'] = 'Bearer validToken';
    authService['tokenExpiresAt'] = new Date(Date.now() + 3600000); // Token expira em 1 hora

    const token = await authService.getToken();

    expect(token).toBe('Bearer validToken');
  });

  it('should fetch new token if current one is expired', async () => {
    authService['token'] = 'Bearer expiredToken';
    authService['tokenExpiresAt'] = new Date(Date.now() - 3600000); // Expirado 1 hora atrás

    const mockResponse = getTokenMockResponse('Bearer', 'newToken', 3600000);

    vi.mocked(httpService.post).mockReturnValueOnce(of(mockResponse));

    const token = await authService.getToken();

    expect(token).toBe('Bearer newToken');
  });
});
