import Decimal from "decimal.js";
import { z } from "zod";

export const decimal = ({
  min,
  max,
  precision,
}: {
  min?: number;
  max?: number;
  precision?: number;
} = {}) => {
  return z.instanceof(Decimal).superRefine((val, ctx) => {
    if (min !== undefined && val.lt(min)) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: min,
        type: "number",
        inclusive: true,
        message: `Must be greater than or equal to ${min}`,
      });
    }
    if (max !== undefined && val.gt(max)) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: max,
        type: "number",
        inclusive: true,
        message: `Must be less than or equal to ${max}`,
      });
    }
    if (precision !== undefined && val.decimalPlaces() > precision) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Cannot have more than ${precision} decimal places`,
      });
    }
  });
};
