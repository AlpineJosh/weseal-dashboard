import type { SubqueryWithSelection } from "drizzle-orm/pg-core";
import { z } from "zod";

import type { Column, SQL } from "@repo/db";
import { and, count } from "@repo/db";

import type { FilterInput, FilterSchema } from "./filter";
import type { PaginationInput, PaginationOutput } from "./pagination";
import type { SearchInput, SearchSchema } from "./search";
import type { SortInput, SortSchema } from "./sort";
import type { DatatableData, DatatableSchema, FieldSelection } from "./types";
import { db } from "../../db";
import { buildFilterClause, buildFilterSchema } from "./filter";
import { pagination } from "./pagination";
import { buildSearchClause, buildSearchSchema } from "./search";
import { buildSortClause, buildSortSchema } from "./sort";
import { getDatatableSchema } from "./types";

export type DatatableInputSchema<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> = z.ZodObject<{
  pagination: z.ZodType<PaginationInput>;
  sort: SortSchema<T, S>;
  filter: FilterSchema<T, S>;
  search: SearchSchema<T, S>;
}>;

export interface DatatableInput<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> {
  pagination?: PaginationInput;
  sort?: SortInput<T, S>;
  filter?: FilterInput<T, S>;
  search?: SearchInput<T, S>;
}

export interface DatatableOutput<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> {
  rows: DatatableData<T, S>[];
  pagination: PaginationOutput;
}

export type DatatableManyQuery<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> = (input: DatatableInput<T, S>) => Promise<DatatableOutput<T, S>>;

export type DatatableFirstQuery<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> = (input: DatatableInput<T, S>) => Promise<DatatableData<T, S>>;

export const datatable = <T extends Record<string, Column | SQL.Aliased>>(
  view: SubqueryWithSelection<T, string>,
): {
  $schema: DatatableInputSchema<T, DatatableSchema<T>>;
  findMany: DatatableManyQuery<T, DatatableSchema<T>>;
  findFirst: DatatableFirstQuery<T, DatatableSchema<T>>;
} => {
  const schema = getDatatableSchema(view);

  const filterSchema = buildFilterSchema(schema);
  const searchSchema = buildSearchSchema(schema);
  const sortSchema = buildSortSchema(schema);
  const paginationSchema = pagination;

  const inputSchema = z.object({
    pagination: paginationSchema,
    sort: sortSchema,
    filter: filterSchema,
    search: searchSchema,
  }) as DatatableInputSchema<T, DatatableSchema<T>>;

  const findMany = async (
    input: DatatableInput<T, DatatableSchema<T>>,
  ): Promise<{
    rows: DatatableData<T, DatatableSchema<T>>[];
    pagination: PaginationOutput;
  }> => {
    const { pagination = { size: 10, page: 1 }, sort, filter, search } = input;
    const where = and(
      buildFilterClause(schema, filter),
      buildSearchClause(schema, search),
    );
    const order = buildSortClause(schema, sort) ?? [];
    const limit = pagination.size;
    const offset = (pagination.page - 1) * pagination.size;
    const total = await db.select({ count: count() }).from(view).where(where);

    const results = await db
      .select()
      .from(view)
      .where(where)
      .orderBy(...order)
      .limit(limit)
      .offset(offset);

    return {
      rows: results as DatatableData<T, DatatableSchema<T>>[],
      pagination: {
        ...pagination,
        total: Number(total[0]?.count ?? 0),
      },
    };
  };

  const findFirst = async (
    input: DatatableInput<T, DatatableSchema<T>>,
  ): Promise<DatatableData<T, DatatableSchema<T>>> => {
    const { sort, filter, search } = input;
    const where = and(
      buildFilterClause(schema, filter),
      buildSearchClause(schema, search),
    );
    const order = buildSortClause(schema, sort) ?? [];

    const results = await db
      .select()
      .from(view)
      .where(where)
      .orderBy(...order)
      .limit(1);

    return results[0] as DatatableData<T, DatatableSchema<T>>;
  };

  return { $schema: inputSchema, findMany, findFirst };
};
