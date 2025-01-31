import type { SubqueryWithSelection } from "drizzle-orm/pg-core";

import type { Column, SQL } from "@repo/db";

export type Field = Column | SQL.Aliased;

export type FieldSelection = Record<string, Field>;

export type FieldDataType =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "date"
  | "array"
  | "json"
  | "custom"
  | "buffer";

export interface DataTypeMap {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  date: Date;
  array: unknown[];
  json: unknown;
  custom: unknown;
  buffer: Buffer;
}

export type InferFieldDataType<T extends Field> =
  T extends SQL.Aliased<infer R>
    ? R extends string
      ? "string"
      : R extends number
        ? "number"
        : R extends Date
          ? "date"
          : R extends boolean
            ? "boolean"
            : R extends bigint
              ? "bigint"
              : R extends Buffer
                ? "buffer"
                : R extends object[]
                  ? "array"
                  : R extends object
                    ? "json"
                    : "custom"
    : T extends Column
      ? T["_"]["dataType"]
      : never;

export type InferFieldType<T extends Field> =
  T extends SQL.Aliased<infer U>
    ? U
    : T extends Column
      ? T["_"]["data"] | (T["_"]["notNull"] extends true ? null : never)
      : never;

export const getFieldDataType = <T extends Field>(
  field: T,
): InferFieldType<T> => {
  if (field._.brand === "Column") {
    return field._.dataType as InferFieldType<T>;
  } else {
    return typeof field._.type as InferFieldType<T>;
  }
};

interface DatatableFieldDefinition<T extends Field> {
  field: T;
  dataType: InferFieldDataType<T>;
  notNull: T extends Column
    ? T["_"]["notNull"]
    : T extends SQL.Aliased<infer R>
      ? R extends null
        ? false
        : true
      : never;
}

export type DatatableSchema<T extends FieldSelection> = {
  [K in keyof T]: DatatableFieldDefinition<T[K]>;
};

export const getDatatableSchema = <T extends FieldSelection>(
  view: SubqueryWithSelection<T, string>,
): DatatableSchema<T> => {
  const schema: Record<string, DatatableFieldDefinition<T[keyof T]>> = {};
  for (const key in view._.selectedFields) {
    const field = view._.selectedFields[key] as Field;
    schema[key] = {
      field: field,
      dataType: getFieldDataType(field),
    } as DatatableFieldDefinition<T[keyof T]>;
  }
  return schema as DatatableSchema<T>;
};

export type DatatableData<
  T extends FieldSelection,
  S extends DatatableSchema<T>,
> = {
  [K in keyof S]: InferFieldType<S[K]["field"]>;
};
