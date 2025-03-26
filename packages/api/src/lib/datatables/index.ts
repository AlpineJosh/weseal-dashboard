import type { SubqueryWithSelection } from "drizzle-orm/pg-core";
import { z } from "zod";

import { and, Column, count, is, sql, SQL } from "@repo/db";

import type {
  DatatableData,
  DatatableDefinition,
  DatatableFirstQuery,
  DatatableInput,
  DatatableInputSchema,
  DatatableManyQuery,
  DatatableOutput,
  Field,
  Fields,
  FieldSelection,
} from "./types";
import { db } from "../../db";
import { buildFilterClause, buildFilterSchema } from "./filter";
import { pagination } from "./pagination";
import { buildSearchClause, buildSearchSchema } from "./search";
import { buildSortClause, buildSortSchema } from "./sort";

export const datatable = <
  T extends DatatableDefinition,
  S extends FieldSelection<T>,
>(
  definition: T,
  view: SubqueryWithSelection<S, string> & {
    _: {
      isSelect: true;
      alias: string;
      selectedFields: Record<keyof S, Field>;
    };
  },
): {
  $schema: DatatableInputSchema<T>;
  findMany: DatatableManyQuery<T>;
  findFirst: DatatableFirstQuery<T>;
} => {
  const fieldBuilder: Partial<Fields<T>> = {};
  for (const key in definition) {
    if (definition[key] === undefined) {
      continue;
    }
    const field = view._.selectedFields[key];

    if (is(field, SQL.Aliased)) {
      fieldBuilder[key] = {
        sql: sql.raw(`"${view._.alias}"."${field.fieldAlias}"`),
        type: definition[key],
      };
    } else if (is(field, Column)) {
      fieldBuilder[key] = {
        sql: sql.raw(`"${view._.alias}"."${field.name}"`),
        type: definition[key],
      };
    }
  }

  const fields = fieldBuilder as Fields<T>;

  const filterSchema = buildFilterSchema(definition);
  const searchSchema = buildSearchSchema(definition);
  const sortSchema = buildSortSchema(definition);
  const paginationSchema = pagination;

  const inputSchema = z.object({
    pagination: paginationSchema.optional(),
    sort: sortSchema.optional(),
    filter: filterSchema,
    search: searchSchema.optional(),
  }) as DatatableInputSchema<T>;

  const findMany = async ({
    pagination = { size: 10, page: 1 },
    sort,
    filter,
    search,
  }: DatatableInput<T>): Promise<DatatableOutput<T>> => {
    const where = and(
      buildFilterClause(fields, filter),
      buildSearchClause(fields, search),
    );
    const order = buildSortClause(fields, sort) ?? [];
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
      rows: results as DatatableData<T>[],
      pagination: {
        ...pagination,
        total: Number(total[0]?.count ?? 0),
      },
    };
  };

  const findFirst = async (
    input: Omit<DatatableInput<T>, "pagination">,
  ): Promise<DatatableData<T>> => {
    const { sort, filter, search } = input;
    const where = and(
      buildFilterClause(fields, filter),
      buildSearchClause(fields, search),
    );
    const order = buildSortClause(fields, sort) ?? [];

    const results = await db
      .select()
      .from(view)
      .where(where)
      .orderBy(...order)
      .limit(1);

    return results[0] as DatatableData<T>;
  };

  return { $schema: inputSchema, findMany, findFirst };
};
