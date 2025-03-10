import type Decimal from "decimal.js";
import type { z } from "zod";

import type { Column, SQL } from "@repo/db";

import type { FilterInput, FilterSchema } from "./filter";
import type { PaginationInput, PaginationOutput } from "./pagination";
import type { SearchInput, SearchSchema } from "./search";
import type { SortInput, SortSchema } from "./sort";

export type FieldDataType =
  | "string"
  | "number"
  | "decimal"
  | "bigint"
  | "boolean"
  | "date"
  | "array"
  | "json"
  | "custom"
  | "buffer"
  | "uuid";

interface DataTypeMap {
  string: string;
  number: number;
  decimal: Decimal;
  bigint: bigint;
  boolean: boolean;
  date: Date;
  array: unknown[];
  json: unknown;
  custom: unknown;
  buffer: Buffer;
}

export type Field = Column | SQL.Aliased;

export type DatatableDefinition = Record<string, FieldDataType>;

export type FieldSelection<T extends DatatableDefinition> = Record<
  keyof T,
  Field
>;

export type Fields<T extends DatatableDefinition> = Record<
  keyof T,
  { sql: SQL; type: FieldDataType }
>;

export type DatatableInputSchema<T extends DatatableDefinition> = z.ZodObject<{
  pagination: z.ZodOptional<z.ZodType<PaginationInput>>;
  sort: z.ZodOptional<SortSchema<T>>;
  filter: FilterSchema<T>;
  search: z.ZodOptional<SearchSchema<T>>;
}>;

export interface DatatableInput<T extends DatatableDefinition> {
  pagination?: PaginationInput;
  sort?: SortInput<T>;
  filter?: FilterInput<T>;
  search?: SearchInput<T>;
}

export type DatatableData<T extends DatatableDefinition> = {
  [K in keyof T]: DataTypeMap[T[K]];
};

export interface DatatableOutput<T extends DatatableDefinition> {
  rows: DatatableData<T>[];
  pagination: PaginationOutput;
}

export type DatatableManyQuery<T extends DatatableDefinition> = (
  input: DatatableInput<T>,
) => Promise<DatatableOutput<T>>;

export type DatatableFirstQuery<T extends DatatableDefinition> = (
  input: DatatableInput<T>,
) => Promise<DatatableData<T>>;
