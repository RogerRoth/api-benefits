import { z } from 'zod';

export const fetchBenefitsQueryDTOSchema = z.object({
  cpf: z
    .string()
    .transform((cpf) => cpf.replace(/\D/g, ''))
    .refine((cpf) => cpf.length === 11, {
      message: 'CPF must have 11 digits after normalization.',
    }),
});

export type FetchBenefitsQueryDTO = z.infer<typeof fetchBenefitsQueryDTOSchema>;
