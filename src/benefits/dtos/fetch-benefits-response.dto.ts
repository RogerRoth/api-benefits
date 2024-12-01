import { z } from 'zod';

export const fetchBenefitsResponseDTOSchema = z.object({
  cpf: z.string(),
  beneficios: z.array(
    z
      .object({
        numero_beneficio: z.string(),
        codigo_tipo_beneficio: z.string(),
      })
      .optional(),
  ),
});

export type FetchBenefitsResponseDTO = z.infer<
  typeof fetchBenefitsResponseDTOSchema
>;
