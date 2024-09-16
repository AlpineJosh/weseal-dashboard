import { z } from "zod";

import {
  and,
  AnyColumn,
  AnyTable,
  asc,
  between,
  Column,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  not,
  notInArray,
  or,
  SQL,
} from "@repo/db";

export const paginationSchema = () =>
  z
    .object({
      page: z.number(),
      size: z.number(),
    })
    .optional()
    .default({
      page: 1,
      size: 10,
    });

export const sortSchema = (fields: [string, ...string[]]) =>
  z
    .array(
      z.object({
        field: z.enum(fields),
        order: z.enum(["asc", "desc"]),
      }),
    )
    .optional()
    .default([]);

export const numberFilterSchema = () =>
  z.object({
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    eq: z.number().optional(),
    neq: z.number().optional(),
  });

export const handleNumberFilter = (
  column: AnyColumn,
  filter: z.infer<ReturnType<typeof numberFilterSchema>>,
) => {
  const where = and(
    filter.lt !== undefined ? lt(column, filter.lt) : undefined,
    filter.lte !== undefined ? lte(column, filter.lte) : undefined,
    filter.gt !== undefined ? gt(column, filter.gt) : undefined,
    filter.gte !== undefined ? gte(column, filter.gte) : undefined,
    filter.eq !== undefined ? eq(column, filter.eq) : undefined,
    filter.neq !== undefined ? not(eq(column, filter.neq)) : undefined,
  );

  return where;
};

export const multiSelectFilterSchema = <T extends z.ZodString>(
  optionSchema: T,
) =>
  z.object({
    in: z.array(optionSchema).optional(),
    notIn: z.array(optionSchema).optional(),
  });

export const handleMultiSelectFilter = <T extends z.ZodString>(
  column: AnyColumn, // Column is of type SQL<string>
  filter: z.infer<ReturnType<typeof multiSelectFilterSchema<T>>>, // Infer the filter type
) => {
  const where = and(
    filter.in ? inArray(column, filter.in) : undefined, // Apply filter conditionally
    filter.notIn ? notInArray(column, filter.notIn) : undefined,
  );

  return where;
};

export const dateFilterSchema = () =>
  z.object({
    lt: z.date().optional(),
    lte: z.date().optional(),
    gt: z.date().optional(),
    gte: z.date().optional(),
    eq: z.date().optional(),
    neq: z.date().optional(),
    between: z.tuple([z.date(), z.date()]).optional(),
  });

export const handleDateFilter = (
  column: AnyColumn,
  filter: z.infer<ReturnType<typeof dateFilterSchema>>,
) => {
  const where = and(
    filter.lt ? lt(column, filter.lt) : undefined,
    filter.lte ? lte(column, filter.lte) : undefined,
    filter.gt ? gt(column, filter.gt) : undefined,
    filter.gte ? gte(column, filter.gte) : undefined,
    filter.eq ? eq(column, filter.eq) : undefined,
    filter.neq ? not(eq(column, filter.neq)) : undefined,
    filter.between ? between(column, ...filter.between) : undefined,
  );

  return where;
};

export const stringFilterSchema = () =>
  z.object({
    startWith: z.string().optional(),
    endsWith: z.string().optional(),
    contains: z.string().optional(),
    notContains: z.string().optional(),
  });

export const handleStringFilter = (
  column: AnyColumn,
  filter: z.infer<ReturnType<typeof stringFilterSchema>>,
) => {
  const where = and(
    filter.startWith ? ilike(column, `${filter.startWith}%`) : undefined,
    filter.endsWith ? ilike(column, `%${filter.endsWith}`) : undefined,
    filter.contains ? ilike(column, `%${filter.contains}%`) : undefined,
    filter.notContains
      ? not(ilike(column, `%${filter.notContains}%`))
      : undefined,
  );

  return where;
};

export const searchFilterSchema = () =>
  z
    .object({
      query: z.string(),
    })
    .optional();

export type DrizzleTable<T> = {
  [K in keyof T]: Column<any>;
};

export const handleSearchFilter = <T extends DrizzleTable<T>>(
  columns: AnyColumn[],
  filter: z.infer<ReturnType<typeof searchFilterSchema>>,
) => {
  if (!filter) {
    return undefined;
  }

  const where = or(
    ...columns.map((column) => ilike(column, `%${filter.query}%`)),
  );

  return where;
};

export const handleSort = <T extends DrizzleTable<T>>(
  table: T,
  sort: z.infer<ReturnType<typeof sortSchema>>,
) => {
  const orderBy = sort.map((item) =>
    item.order === "asc"
      ? asc(table[item.field as keyof T] as any)
      : desc(table[item.field as keyof T] as any),
  );

  return orderBy;
};

export const handlePagination = (
  pagination: z.infer<ReturnType<typeof paginationSchema>>,
) => {
  const { page, size } = pagination;
  const offset = (page - 1) * size;
  return {
    limit: size,
    offset,
  };
};
