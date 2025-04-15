import { z } from "zod";

export const USER_ROLES = ["admin", "user"] as const;

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(), 
  role: z.enum(USER_ROLES),
});

export type User = z.infer<typeof userSchema>;