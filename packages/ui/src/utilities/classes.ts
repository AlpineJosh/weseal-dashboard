import type { ClassValue } from "tailwind-variants";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

export type { ClassValue, ClassProp, VariantProps } from "tailwind-variants";

export const cv = tv;

export const cx = (...classes: ClassValue[]): string => {
  return twMerge(...classes);
};
