import bitSystemsSchema from "./bit-systems";
import * as publicSchema from "./public";
import sageSchema from "./sage";

export type Schema = typeof publicSchema &
  typeof sageSchema &
  typeof bitSystemsSchema;

export const schema = {
  ...publicSchema,
  ...sageSchema,
  ...bitSystemsSchema,
} as Schema;

export { bitSystemsSchema, publicSchema, sageSchema };
