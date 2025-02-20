import { z } from "zod";

export interface PaginationInput {
  page: number;
  size: number;
}

export interface PaginationOutput {
  page: number;
  size: number;
  total: number;
}

export type PaginationSchema = z.ZodType<PaginationInput>;

export const pagination = z
  .object({
    page: z.number().min(1),
    size: z.number().min(1),
  })
  .optional();
