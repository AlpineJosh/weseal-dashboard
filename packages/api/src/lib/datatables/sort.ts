import { z } from "zod";

import type { SQL } from "@repo/db";
import { asc, desc } from "@repo/db";

import type { DatatableSchema, FieldSelection } from "./types";

export type SortInput<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> = {
  field: keyof S;
  direction: "asc" | "desc";
}[];

export type SortOutput<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> = {
  field: keyof S;
  direction: "asc" | "desc";
}[];

export type SortSchema<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> = z.ZodOptional<z.ZodType<SortInput<T, S>>>;

export const buildSortSchema = <
  T extends FieldSelection,
  S extends DatatableSchema<T>,
>(
  schema: S,
): SortSchema<T, S> => {
  const fieldEnum = z.enum(Object.keys(schema) as [string, ...string[]]);
  return z
    .array(
      z.object({
        field: fieldEnum,
        direction: z.enum(["asc", "desc"]),
      }),
    )
    .optional();
};

export const buildSortClause = <
  T extends FieldSelection,
  S extends DatatableSchema<T>,
>(
  schema: S,
  input?: SortInput<T, S>,
): undefined | [SQL, ...SQL[]] => {
  if (!input || input.length === 0) return undefined;

  return input.map(({ field, direction }) => {
    const column = schema[field].field;
    return direction === "asc" ? asc(column) : desc(column);
  }) as [SQL, ...SQL[]];
};
