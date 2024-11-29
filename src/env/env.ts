import { z } from 'zod';

export const envSchema = z.object({
  KONSI_BASE_URL: z.string().url(),
  KONSI_AUTH_USER: z.string(),
  KONSI_AUTH_PASSWORD: z.string(),
  ELASTIC_SEARCH_URL: z.string().url(),
  ELASTIC_SEARCH_USERNAME: z.string(),
  ELASTIC_SEARCH_PASSWORD: z.string(),
  RABBITMQ_URL: z.string(),
  RABBITMQ_QUEUE: z.string(),
  REDIS_URL: z.string(),
  PORT: z.coerce.number().optional().default(3000),
});

export type Env = z.infer<typeof envSchema>;

