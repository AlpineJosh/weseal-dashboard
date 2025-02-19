import { z } from "zod";

import type { SQL } from "@repo/db";
import { asc, desc } from "@repo/db";

import type { DatatableDefinition, Fields } from "./types";

export type SortInput<T extends DatatableDefinition> = {
  field: keyof T;
  order: "asc" | "desc";
}[];

export type SortOutput<T extends DatatableDefinition> = {
  field: keyof T;
  order: "asc" | "desc";
}[];

export type SortSchema<T extends DatatableDefinition> = z.ZodOptional<
  z.ZodType<SortInput<T>>
>;

export const buildSortSchema = <T extends DatatableDefinition>(
  definition: T,
): SortSchema<T> => {
  const fieldEnum = z.enum(Object.keys(definition) as [string, ...string[]]);
  return z
    .array(
      z.object({
        field: fieldEnum,
        order: z.enum(["asc", "desc"]),
      }),
    )
    .optional();
};

export const buildSortClause = <T extends DatatableDefinition>(
  fields: Fields<T>,
  input?: SortInput<T>,
): undefined | [SQL, ...SQL[]] => {
  if (!input || input.length === 0) return undefined;

  return input.map(({ field, order }) => {
    const column = fields[field].sql;
    return order === "asc" ? asc(column) : desc(column);
  }) as [SQL, ...SQL[]];
};
