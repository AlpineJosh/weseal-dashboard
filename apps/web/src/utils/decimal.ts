import { Decimal } from "decimal.js";
import { z } from "zod";

const decimal = () =>
  z
    .custom<Decimal>((val: Decimal | number | string) => {
      try {
        if (val instanceof Decimal) return true;
        new Decimal(val);
        return true;
      } catch {
        return false;
      }
    }, "Invalid decimal value")
    .transform((val) => (val instanceof Decimal ? val : new Decimal(val)));

// Extend Zod properly
declare module "zod" {
  interface ZodString {
    decimal: typeof decimal;
  }
}
export { decimal };
