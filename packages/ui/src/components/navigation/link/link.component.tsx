// import { focusRing } from "./utils";
import { cn } from "@/lib/class-merge";
import { cva } from "class-variance-authority";
import {
  Link as AriaLink,
  LinkProps as AriaLinkProps,
} from "react-aria-components";

interface LinkProps extends AriaLinkProps {
  variant?: "primary" | "secondary";
}

const linkVariants = cva(
  "rounded underline transition disabled:cursor-default disabled:no-underline forced-colors:disabled:text-[GrayText]",
  {
    // extend: focusRing,

    variants: {
      variant: {
        primary:
          "text-blue-600 underline decoration-blue-600/60 hover:decoration-blue-600 dark:text-blue-500 dark:decoration-blue-500/60 dark:hover:decoration-blue-500",
        secondary:
          "text-gray-700 underline decoration-gray-700/50 hover:decoration-gray-700 dark:text-zinc-300 dark:decoration-zinc-300/70 dark:hover:decoration-zinc-300",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export const Link = ({ className, variant, ...props }: LinkProps) => {
  return (
    <AriaLink {...props} className={cn(linkVariants({ variant }), className)} />
  );
};

export type { LinkProps };
