import { cva } from "class-variance-authority";

const controlVariants = cva(
  [
    // Base layout
    "relative block w-full overflow-hidden",

    // Background and shadow (before pseudo)
    "before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow",
    "dark:before:hidden",

    // Focus ring (after pseudo)
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-ring",

    // Border styling and states
    "rounded-lg border border-content/10 data-[hovered]:border-content/20",
    "has-[:invalid]:border-error/50 has-[:invalid]:data-[hovered]:border-error/50 has-[:invalid]:after:focus-within:ring-error/50",
    "has-[:disabled]:opacity-50 has-[:disabled]:before:bg-content/5 has-[:disabled]:before:shadow-none has-[:disabled]:dark:before:bg-white/5",

    // Common spacing
    "[&>*]:px-[calc(theme(spacing[3.5])-1px)] [&>*]:py-[calc(theme(spacing[2.5])-1px)]",

    // Common text styling
    "[&>*]:text-base/6 [&>*]:text-content [&>*]:placeholder:text-content-muted",
  ],
  {
    variants: {
      size: {
        sm: "[&>*]:px-3 [&>*]:py-2 [&>*]:text-sm",
        md: "", // default size
        lg: "[&>*]:px-4 [&>*]:py-3 [&>*]:text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);
