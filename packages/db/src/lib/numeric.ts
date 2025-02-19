import Decimal from "decimal.js";
import { customType } from "drizzle-orm/pg-core";

export const numericDecimal = customType<{
  data: Decimal;
  driverData: string;

  config?: {
    precision?: number;
    scale?: number;
  };

  dataType: "decimal";
  columnType: "PgNumeric";
}>({
  dataType(config = { precision: 15, scale: 6 }) {
    return `NUMERIC(${config.precision},${config.scale})`;
  },
  toDriver(value: Decimal | number | string | null): string {
    if (value === null) {
      return "NULL";
    }
    if (typeof value === "number") {
      return value.toString();
    }
    if (typeof value === "string") {
      return value;
    }
    return value.toString();
  },
  fromDriver(value: string): Decimal {
    return new Decimal(value);
  },
});
