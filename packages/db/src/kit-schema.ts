import base from "./schema/public";
import * as sage from "./schema/sage"
import * as bitSystems from "./schema/bit-systems"

export default {
    ...base,
    ...sage,
    ...bitSystems
} as Record<string, unknown>