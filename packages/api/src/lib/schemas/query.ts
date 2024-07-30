import type { Table } from "@repo/db";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().min(1),
  count: z.number().min(5).max(100),
});

export const sortSchema = (fields: [string, ...string[]]) =>
  z.array(
    z.object({
      field: z.enum(fields),
      order: z.enum(["asc", "desc"]).default("asc"),
    }),
  );

export const searchSchema = (fields?: [string, ...string[]]) =>
  fields && fields.length > 0
    ? z.array(
        z.object({
          query: z.string().max(100),
          fields: z.array(z.enum(fields)).optional(),
        }),
      )
    : z.array(
        z.object({
          query: z.string().max(100),
        }),
      );

export const dateRangeFilterSchema = z.object({
  start: z.date(),
  end: z.date(),
});

export const numberRangeFilterSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const valueFilterSchema = z.array(z.string());

export const enumFilterSchema = (options: [string, ...string[]]) =>
  z.array(z.enum(options));

export const filterSchema = (fields: [string, ...string[]]) =>
  z.array(
    z.object({
      field: z.enum(fields),
      filter: z.union([
        dateRangeFilterSchema,
        numberRangeFilterSchema,
        valueFilterSchema,
        enumFilterSchema(fields),
      ]),
    }),
  );

  export interface queryField {
    field: string,
    sortable?: boolean,
    searchable?: boolean,
    filterable?: boolean 
  }

