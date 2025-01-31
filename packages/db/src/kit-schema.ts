import bitSystemsSchema from "./schema/bit-systems";
import publicSchema from "./schema/public";
import sageSchema from "./schema/sage";

export default {
  ...publicSchema,
  ...sageSchema,
  ...bitSystemsSchema,
} as Record<string, unknown>;
