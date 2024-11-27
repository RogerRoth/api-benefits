import { z } from 'zod';

export const fetchBenefitsQueryDTOSchema = z.object({
  cpf: z.string(),
});

export type FetchBenefitsQueryDTO = z.infer<typeof fetchBenefitsQueryDTOSchema>;
