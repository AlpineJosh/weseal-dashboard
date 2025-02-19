import { z } from "zod";

import type { SQL } from "@repo/db";
import {
  and,
  between,
  eq,
  gt,
  gte,
  isNull,
  lt,
  lte,
  ne,
  not,
  sql,
} from "@repo/db";

import type { DatatableDefinition, FieldDataType, Fields } from "./types";

export const numberFilterSchema = z
  .object({
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    eq: z.number().optional(),
    neq: z.number().optional(),
    null: z.boolean().optional(),
  })
  .optional();

export const stringFilterSchema = z
  .object({
    startWith: z.string().optional(),
    endsWith: z.string().optional(),
    contains: z.string().optional(),
    notContains: z.string().optional(),
    eq: z.string().optional(),
    null: z.boolean().optional(),
  })
  .optional();

export const dateFilterSchema = z
  .object({
    lt: z.date().optional(),
    lte: z.date().optional(),
    gt: z.date().optional(),
    gte: z.date().optional(),
    eq: z.date().optional(),
    neq: z.date().optional(),
    between: z.tuple([z.date(), z.date()]).optional(),
    null: z.boolean().optional(),
  })
  .optional();

export const booleanFilterSchema = z
  .object({
    eq: z.boolean().optional(),
    neq: z.boolean().optional(),
    null: z.boolean().optional(),
  })
  .optional();

export interface FilterSchemaMap extends Record<FieldDataType, z.ZodType> {
  string: typeof stringFilterSchema;
  number: typeof numberFilterSchema;
  decimal: typeof numberFilterSchema;
  date: typeof dateFilterSchema;
  boolean: typeof booleanFilterSchema;
  bigint: typeof numberFilterSchema;
  array: never;
  json: never;
  custom: never;
  buffer: never;
}

export type FilterInput<T extends DatatableDefinition> = {
  [K in keyof T]?: z.infer<FilterSchemaMap[T[K]]>;
};

export type FilterSchema<T extends DatatableDefinition> = z.ZodOptional<
  z.ZodObject<{
    [K in keyof T]: z.ZodOptional<FilterSchemaMap[T[K]]>;
  }>
>;

export const buildFilterSchema = <T extends DatatableDefinition>(
  definition: T,
): FilterSchema<T> => {
  const filterSchema: Record<string, z.ZodType> = {};
  for (const key in definition) {
    const dataType = definition[key];
    if (dataType === "string") {
      filterSchema[key] = stringFilterSchema;
    } else if (
      dataType === "number" ||
      dataType === "bigint" ||
      dataType === "decimal"
    ) {
      filterSchema[key] = numberFilterSchema;
    } else if (dataType === "date") {
      filterSchema[key] = dateFilterSchema;
    } else if (dataType === "boolean") {
      filterSchema[key] = booleanFilterSchema;
    }
  }

  return z.object(filterSchema).optional() as FilterSchema<T>;
};

export const buildFilterClause = <T extends DatatableDefinition>(
  fields: Fields<T>,
  filter?: FilterInput<T>,
): SQL | undefined => {
  if (!filter) return undefined;

  const whereClause: SQL[] = [];
  for (const key in fields) {
    const columnFilter = filter[key];
    const dataType = fields[key].type;

    const field = fields[key].sql;

    if (!columnFilter) continue;

    // Common filters across all types
    if (columnFilter.null) {
      whereClause.push(isNull(field));
    }
    if (columnFilter.eq !== undefined) {
      whereClause.push(eq(field, columnFilter.eq));
    }

    // Type-specific filters
    switch (dataType) {
      case "number":
      case "bigint":
      case "decimal":
      case "date": {
        const f = columnFilter as z.infer<
          typeof numberFilterSchema | typeof dateFilterSchema
        >;
        if (f?.neq !== undefined) {
          whereClause.push(ne(field, f.neq));
        }
        if (f?.gt !== undefined) {
          whereClause.push(gt(field, f.gt));
        }
        if (f?.gte !== undefined) {
          whereClause.push(gte(field, f.gte));
        }
        if (f?.lt !== undefined) {
          whereClause.push(lt(field, f.lt));
        }
        if (f?.lte !== undefined) {
          whereClause.push(lte(field, f.lte));
        }
        if (f && "between" in f && f.between) {
          whereClause.push(between(field, f.between[0], f.between[1]));
        }
        break;
      }
      case "string": {
        const f = columnFilter as z.infer<typeof stringFilterSchema>;
        if (f?.contains) {
          whereClause.push(sql`${field} ILIKE ${`%${f.contains}%`}`);
        }
        if (f?.notContains) {
          whereClause.push(sql`${field} NOT ILIKE ${`%${f.notContains}%`}`);
        }
        if (f?.startWith) {
          whereClause.push(sql`${field} ILIKE ${`${f.startWith}%`}`);
        }
        if (f?.endsWith) {
          whereClause.push(sql`${field} ILIKE ${`%${f.endsWith}`}`);
        }
        break;
      }
      case "boolean": {
        const f = columnFilter as z.infer<typeof booleanFilterSchema>;
        if (f?.neq !== undefined) {
          whereClause.push(not(eq(field, f.neq)));
        }
        break;
      }
    }
  }

  return and(...whereClause);
};
