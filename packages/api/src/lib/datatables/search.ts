import { z } from "zod";

import type { SQL } from "@repo/db";
import { and, or, sql } from "@repo/db";

import type { DatatableSchema, FieldSelection } from "./types";

export interface SearchInput<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> {
  query: string;
  fields?: [keyof S, ...(keyof S)[]];
}

export interface SearchOutput<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> {
  query: string;
  fields?: [keyof S, ...(keyof S)[]];
}

export type SearchSchema<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> = z.ZodType<SearchInput<T, S>>;

export const buildSearchSchema = <
  T extends FieldSelection,
  S extends DatatableSchema<T>,
>(
  schema: S,
): z.ZodOptional<SearchSchema<T, S>> => {
  const fieldEnum = z.enum(Object.keys(schema) as [string, ...string[]]);
  return z
    .object({
      query: z.string(),
      fields: fieldEnum.optional(),
    })
    .optional() as z.ZodOptional<SearchSchema<T, S>>;
};

export const buildSearchClause = <
  T extends FieldSelection,
  S extends DatatableSchema<T>,
>(
  schema: S,
  input?: SearchInput<T, S>,
): SQL | undefined => {
  if (!input) return undefined;

  const { query, fields } = input;
  const whereClause: (SQL | undefined)[] = [];
  if (query.length > 0) {
    const parts = query.trim().split(/\s+/);
    parts.forEach((part) => {
      const partWhere: SQL[] = [];
      for (const key of fields ?? []) {
        const field = schema[key].field.getSQL();
        partWhere.push(sql`${field} ilike ${`%${part}%`}`);
      }
      whereClause.push(or(...partWhere));
    });
  }

  return and(...whereClause);
};
