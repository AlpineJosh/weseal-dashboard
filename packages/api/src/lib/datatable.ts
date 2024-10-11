import { z } from "zod";

import {
  and,
  AnyColumn,
  asc,
  between,
  Column,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  lt,
  lte,
  not,
  or,
  Simplify,
  SQL,
  sql,
  SQLWrapper,
  Table,
} from "@repo/db";
import { db } from "@repo/db/client";

const paginationSchema = z
  .object({
    page: z.number(),
    size: z.number(),
  })
  .optional()
  .default({
    page: 1,
    size: 10,
  });

const numberFilterSchema = z.object({
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  eq: z.number().optional(),
  neq: z.number().optional(),
});

const stringFilterSchema = z.object({
  startWith: z.string().optional(),
  endsWith: z.string().optional(),
  contains: z.string().optional(),
  notContains: z.string().optional(),
  eq: z.string().optional(),
});

const dateFilterSchema = z.object({
  lt: z.date().optional(),
  lte: z.date().optional(),
  gt: z.date().optional(),
  gte: z.date().optional(),
  eq: z.date().optional(),
  neq: z.date().optional(),
  between: z.tuple([z.date(), z.date()]).optional(),
});

const booleanFilterSchema = z.object({
  eq: z.boolean().optional(),
  neq: z.boolean().optional(),
});

type TableColumns<T extends Table> = T["_"]["columns"];
type ColumnKey<T extends Table> = keyof TableColumns<T> & string;

type ColumnFilterSchema<TColumn extends Column> =
  TColumn["_"]["dataType"] extends infer TDataType
    ? TDataType extends "number"
      ? typeof numberFilterSchema
      : TDataType extends "string"
        ? typeof stringFilterSchema
        : TDataType extends "date"
          ? typeof dateFilterSchema
          : TDataType extends "boolean"
            ? typeof booleanFilterSchema
            : z.ZodAny
    : never;

type FilterSchema<TTable extends Table> = Simplify<
  TableColumns<TTable> extends infer TColumns extends Record<
    string,
    Column<any>
  >
    ? {
        [K in keyof TColumns & string]: z.ZodOptional<
          ColumnFilterSchema<TColumns[K]>
        >;
      }
    : never
>;

type SearchSchema<TTable extends Table> = z.ZodObject<{
  query: z.ZodString;
  fields: z.ZodOptional<
    z.ZodArray<z.ZodEnum<[ColumnKey<TTable>, ...ColumnKey<TTable>[]]>>
  >;
}>;

type ColumnSortSchema<TTable extends Table> = z.ZodObject<{
  field: z.ZodEnum<[ColumnKey<TTable>, ...ColumnKey<TTable>[]]>;
  order: z.ZodEnum<["asc", "desc"]>;
}>;

type PaginationSchema = z.ZodObject<{
  page: z.ZodNumber;
  size: z.ZodNumber;
}>;

type InputSchema<TTable extends Table> = z.ZodObject<{
  pagination: z.ZodOptional<PaginationSchema>;
  sort: z.ZodOptional<z.ZodArray<ColumnSortSchema<TTable>>>;
  filter: z.ZodOptional<z.ZodObject<FilterSchema<TTable>>>;
  search: z.ZodOptional<SearchSchema<TTable>>;
}>;

type DatatableOutput<T extends Table> = {
  rows: T["$inferSelect"][];
  pagination: {
    page: number;
    size: number;
    total: number;
  };
};

export const datatable = <T extends Table>(
  table: T,
): {
  inputSchema: InputSchema<T>;
  query: (input: z.infer<InputSchema<T>>) => Promise<DatatableOutput<T>>;
} => {
  const columns: TableColumns<T> = getTableColumns(table);
  const columnEntries = Object.entries(columns);

  const fieldEnum = z.enum(
    columnEntries.map(([key]) => key) as [ColumnKey<T>, ...ColumnKey<T>[]],
  );

  const sort = z.array(
    z.object({
      field: fieldEnum,
      order: z.enum(["asc", "desc"]),
    }),
  );

  const search = z.object({
    query: z.string(),
    fields: z.array(fieldEnum).optional(),
  });

  const filter = Object.fromEntries(
    columnEntries
      .filter(([key, column]) =>
        ["string", "number", "date", "boolean"].includes(column.dataType),
      )
      .map(([key, column]) => {
        let schema;
        if (column.dataType === "string") {
          schema = stringFilterSchema;
        } else if (column.dataType === "number") {
          schema = numberFilterSchema;
        } else if (column.dataType === "date") {
          schema = dateFilterSchema;
        } else if (column.dataType === "boolean") {
          schema = booleanFilterSchema;
        }
        return [key, schema?.optional()];
      }),
  ) as FilterSchema<T>;

  const inputSchema: InputSchema<T> = z.object({
    pagination: z
      .object({
        page: z.number(),
        size: z.number(),
      })
      .optional(),
    sort: sort.optional(),
    filter: z.object(filter).optional(),
    search: search.optional(),
  });

  const query = async (
    input: z.infer<InputSchema<T>>,
  ): Promise<DatatableOutput<T>> => {
    const {
      pagination = { page: 1, size: 10 },
      sort = [],
      filter,
      search,
    } = input;

    const where = [];

    if (search && search.query.length > 0) {
      const searchWhere: (SQL | undefined)[] = [];
      const parts = search.query.trim().split(/\s+/);
      parts.forEach((part) => {
        const partWhere: SQLWrapper[] = [];
        Object.entries(columns).forEach(([key, column]) => {
          if (
            search &&
            (search.fields === undefined || search.fields.includes(key))
          ) {
            partWhere.push(sql<boolean>`${column}::text ILIKE ${`%${part}%`}`);
          }
          console.log(partWhere);
        });
        searchWhere.push(or(...partWhere));
      });
      where.push(and(...searchWhere));
    }

    for (const [key, column] of Object.entries(columns)) {
      if (!!filter && filter[key]) {
        if (column.dataType === "string") {
          const columnFilter = filter[key] as z.infer<
            typeof stringFilterSchema
          >;
          where.push(
            columnFilter.startWith !== undefined
              ? ilike(column, `${columnFilter.startWith}%`)
              : undefined,
            columnFilter.endsWith !== undefined
              ? ilike(column, `%${columnFilter.endsWith}`)
              : undefined,
            columnFilter.contains !== undefined
              ? ilike(column, `%${columnFilter.contains}%`)
              : undefined,
            columnFilter.notContains !== undefined
              ? not(ilike(column, `%${columnFilter.notContains}%`))
              : undefined,
            columnFilter.eq !== undefined
              ? eq(column, columnFilter.eq)
              : undefined,
          );
        } else if (column.dataType === "number") {
          const columnFilter = filter[key] as z.infer<
            typeof numberFilterSchema
          >;

          where.push(
            columnFilter.lt !== undefined
              ? lt(column, columnFilter.lt)
              : undefined,
            columnFilter.lte !== undefined
              ? lte(column, columnFilter.lte)
              : undefined,
            columnFilter.gt !== undefined
              ? gt(column, columnFilter.gt)
              : undefined,
            columnFilter.gte !== undefined
              ? gte(column, columnFilter.gte)
              : undefined,
            columnFilter.eq !== undefined
              ? eq(column, columnFilter.eq)
              : undefined,
            columnFilter.neq !== undefined
              ? not(eq(column, columnFilter.neq))
              : undefined,
          );
        } else if (column.dataType === "date") {
          const columnFilter = filter[key] as z.infer<typeof dateFilterSchema>;
          where.push(
            columnFilter.lt !== undefined
              ? lt(column, columnFilter.lt)
              : undefined,
            columnFilter.lte !== undefined
              ? lte(column, columnFilter.lte)
              : undefined,
            columnFilter.gt !== undefined
              ? gt(column, columnFilter.gt)
              : undefined,
            columnFilter.gte !== undefined
              ? gte(column, columnFilter.gte)
              : undefined,
            columnFilter.eq !== undefined
              ? eq(column, columnFilter.eq)
              : undefined,
            columnFilter.neq !== undefined
              ? not(eq(column, columnFilter.neq))
              : undefined,
            columnFilter.between !== undefined
              ? between(column, ...columnFilter.between)
              : undefined,
          );
        } else if (column.dataType === "boolean") {
          const columnFilter = filter[key] as z.infer<
            typeof booleanFilterSchema
          >;
          where.push(
            columnFilter.eq !== undefined
              ? eq(column, columnFilter.eq)
              : undefined,
            columnFilter.neq !== undefined
              ? not(eq(column, columnFilter.neq))
              : undefined,
          );
        }
      }
    }

    const orderBy = sort?.map(({ field, order }) =>
      order === "asc"
        ? asc(columns[field as ColumnKey<T>] as AnyColumn)
        : desc(columns[field as ColumnKey<T>] as AnyColumn),
    );

    const total = await db
      .select({ count: count() })
      .from(table)
      .where(and(...where));

    const results = await db
      .select()
      .from(table)
      .where(and(...where))
      .orderBy(...orderBy)
      .limit(pagination.size)
      .offset((pagination.page - 1) * pagination.size);

    return {
      rows: results,
      pagination: {
        ...pagination,
        total: total[0]?.count ?? 0,
      },
    };
  };

  return {
    inputSchema,
    query,
  };
};
