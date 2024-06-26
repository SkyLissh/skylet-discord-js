import { z } from "zod";

export const McServerSattusSchema = z.object({
  ip: z.string().ip(),
  online: z.boolean(),
  motd: z
    .array(
      z.object({
        raw: z.string().array(),
        clean: z.string().array(),
        html: z.string().array(),
      })
    )
    .optional(),
  players: z
    .object({
      online: z.number(),
      max: z.number(),
    })
    .optional(),
  version: z.string().optional(),
});

export type McServerSattus = z.infer<typeof McServerSattusSchema>;
