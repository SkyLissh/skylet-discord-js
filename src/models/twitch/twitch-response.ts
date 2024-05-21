import { z } from "zod";

export const TwitchResponseSchema = z.object({
  total: z.number().optional(),
  pagination: z
    .object({
      cursor: z.string().optional(),
    })
    .optional(),
});

export type TwitchResponse = z.infer<typeof TwitchResponseSchema>;
