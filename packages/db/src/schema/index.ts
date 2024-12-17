import  base from "./public";
import * as sage from "./sage"
import * as bitSystems from "./bit-systems"
import * as views from "./views"

export type UnifiedSchema = typeof base & typeof views & typeof sage & typeof bitSystems

export const unifiedSchema = {
    ...base,
    ...views,
    ...sage,
    ...bitSystems
} as UnifiedSchema

export const schema = {
    base: {
        ...base,
        ...views,
    },
    sage,
    bitSystems
}

export type DatabaseSchema = {
    base: typeof schema.base;
    sage: typeof schema.sage;
    bitSystems: typeof schema.bitSystems;
  };