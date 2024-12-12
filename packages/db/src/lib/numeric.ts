import { customType } from "drizzle-orm/pg-core";

export const numericDecimal = customType<{
  data: number;
  driverData: string;

  config?: {
    precision?: number;
    scale?: number;
  };

  dataType: "number";
  columnType: "PgNumeric";
}>({
  dataType(config = { precision: 15, scale: 6 }) {
    return `decimal(${config.precision},${config.scale})`;
  },
  toDriver(value: number): string {
    return value.toString();
  },
  fromDriver(value: string): number {
    return Number(value);
  },
});
