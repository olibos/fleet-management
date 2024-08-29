import { z } from 'astro:schema';
export const updateMappingRequest = z.object({
    cardId: z.number().gt(0),
    company: z.string().min(1),
    analyticId: z.string().max(8).nullable()
});

export type UpdateMappingRequest = z.infer<typeof updateMappingRequest>;