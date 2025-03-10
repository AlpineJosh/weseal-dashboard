import { z } from "zod";

import type { SQL } from "@repo/db";
import { and, or, sql } from "@repo/db";

import type { DatatableDefinition, Fields } from "./types";

export interface SearchInput<T extends DatatableDefinition> {
  query: string;
  fields?: (keyof T)[];
}

export interface SearchOutput<T extends DatatableDefinition> {
  query: string;
  fields?: (keyof T)[];
}

export type SearchSchema<T extends DatatableDefinition> = z.ZodType<
  SearchInput<T>
>;

export const buildSearchSchema = <T extends DatatableDefinition>(
  definition: T,
): z.ZodOptional<SearchSchema<T>> => {
  const fieldEnum = z.enum(Object.keys(definition) as [string, ...string[]]);
  return z
    .object({
      query: z.string(),
      fields: z.array(fieldEnum).min(1).optional(),
    })
    .optional();
};

export const buildSearchClause = <T extends DatatableDefinition>(
  availableFields: Fields<T>,
  input?: SearchInput<T>,
): SQL | undefined => {
  if (!input) return undefined;

  const { query, fields } = input;
  const whereClause: (SQL | undefined)[] = [];
  if (query.length > 0) {
    const parts = query.trim().split(/\s+/);
    parts.forEach((part) => {
      const partWhere: SQL[] = [];
      for (const key of fields ?? Object.keys(availableFields)) {
        const field = availableFields[key];
        switch (field.type) {
          case "string":
            partWhere.push(sql`${field.sql} ilike ${`%${part}%`}`);
            break;
          case "number":
          case "bigint":
          case "decimal":
            partWhere.push(
              sql`cast(${field.sql} as text) ilike ${`%${part}%`}`,
            );
            break;
          default:
            continue;
        }
      }
      whereClause.push(or(...partWhere));
    });
  }

  return and(...whereClause);
};
