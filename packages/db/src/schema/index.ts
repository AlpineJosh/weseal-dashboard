import * as sageSchema from "./sage.schema";
import * as stockSchema from "./stock.schema";

export const flatSchema = {
  ...sageSchema,
  ...stockSchema,
};

export const schema = {
  stock: stockSchema,
  sage: sageSchema,
};
