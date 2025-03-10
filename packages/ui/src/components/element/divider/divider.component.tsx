"use client";

import { cv, VariantProps } from "@/utilities";

const variants = cv({
  variants: {
    orientation: {
      horizontal: "h-0 w-full border-t",
      vertical: "w-0 border-l",
    },
    soft: {
      true: "border-content/5",
      false: "border-content/10",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    soft: false,
  },
});

type DividerProps = VariantProps<typeof variants> & { className?: string };

const Divider = ({ orientation, className, soft, ...props }: DividerProps) => {
  return (
    <div {...props} className={variants({ orientation, soft, className })} />
  );
};

export { Divider };
export type { DividerProps };
