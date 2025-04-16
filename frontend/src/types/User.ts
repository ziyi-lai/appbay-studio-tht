import { z } from "zod";

export const USER_ROLES = ["admin", "user"] as const;

export const userSchema = z.object({
  id: z.number(),
  name: z.string()
  .nonempty("Name is requierd.")
  .regex(/^[A-Za-z0-9 ]+$/, "Name must contain only letters, numbers, and spaces."),
  email: z.string().email("Invalid email address"), 
  role: z.enum(USER_ROLES),
  createdAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;