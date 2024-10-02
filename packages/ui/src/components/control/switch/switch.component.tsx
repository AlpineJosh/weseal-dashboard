import type { SwitchProps as AriaSwitchProps } from "react-aria-components";
import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import * as Aria from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

import { colorVariants } from "../../../lib/colors";

const variants = {
  switch: cva(
    [
      // Base styles
      "group relative isolate inline-flex h-6 w-10 cursor-default rounded-full p-[3px] sm:h-5 sm:w-8",
      // Transitions
      "transition duration-0 ease-in-out data-[changing]:duration-200",
      // Unchecked
      "bg-content/10 ring-1 ring-inset ring-content/10",
      // Checked
      "data-[selected]:bg-color data-[selected]:ring-color-border/90",
      // Focus
      "focus:outline-none data-[focus]:outline data-[focused]:outline-2 data-[focused]:outline-offset-2 data-[focused]:outline-ring",
      // Hover
      "data-[hovered]:data-[selected]:ring-color-border/90 data-[hovered]:ring-content/15",
      // Disabled
      // "data-[disabled]:bg-zinc-200 data-[disabled]:data-[selected]:bg-zinc-200 data-[disabled]:data-[selected]:ring-black/5 data-[disabled]:opacity-50",
      // "dark:data-[disabled]:bg-white/15 dark:data-[disabled]:data-[selected]:bg-white/15 dark:data-[disabled]:data-[selected]:ring-white/15",
    ],
    {
      variants: {
        color: colorVariants,
      },
      defaultVariants: {
        color: "primary",
      },
    },
  ),
  indicator: cva([
    // Basic layout
    "pointer-events-none relative inline-block size-[1.125rem] rounded-full sm:size-3.5",
    // Transition
    "translate-x-0 transition duration-200 ease-in-out",
    // Invisible border so the switch is still visible in forced-colors mode
    "border-transparent border",
    // Unchecked
    "bg-background shadow ring-1 ring-content/5",
    // Checked
    "group-data-[selected]:ring-transparent group-data-[selected]:bg-background group-data-[selected]:shadow-color-text/30",
    "group-data-[selected]:translate-x-4 sm:group-data-[selected]:translate-x-3",
    // Disabled
    // "group-data-[disabled]:group-data-[selected]:bg-white group-data-[disabled]:group-data-[selected]:ring-black/5 group-data-[disabled]:group-data-[selected]:shadow",
  ]),
};

export function SwitchGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="control"
      {...props}
      className={cn(
        className,
        // Basic groups
        "space-y-3 [&_[data-slot=label]]:font-normal",
        // With descriptions
        "has-[[data-slot=description]]:space-y-6 [&_[data-slot=label]]:has-[[data-slot=description]]:font-medium",
      )}
    />
  );
}

// export function SwitchField({ className, ...props }: { className?: string } & Omit<Headless.FieldProps, 'className'>) {
//   return (
//     <Headless.Field
//       data-slot="field"
//       {...props}
//       className={clsx(
//         className,
//         // Base layout
//         'grid grid-cols-[1fr_auto] items-center gap-x-8 gap-y-1 sm:grid-cols-[1fr_auto]',
//         // Control layout
//         '[&>[data-slot=control]]:col-start-2 [&>[data-slot=control]]:self-center',
//         // Label layout
//         '[&>[data-slot=label]]:col-start-1 [&>[data-slot=label]]:row-start-1 [&>[data-slot=label]]:justify-self-start',
//         // Description layout
//         '[&>[data-slot=description]]:col-start-1 [&>[data-slot=description]]:row-start-2',
//         // With description
//         '[&_[data-slot=label]]:has-[[data-slot=description]]:font-medium'
//       )}
//     />
//   )
// }

type SwitchProps = Aria.SwitchProps & VariantProps<typeof variants.switch>;

const Switch = ({ color, className, ...props }: SwitchProps) => {
  return (
    <Aria.Switch
      data-slot="control"
      {...props}
      className={cn(variants.switch({ color }), className)}
    >
      <span aria-hidden="true" className={variants.indicator()} />
    </Aria.Switch>
  );
};

export { Switch };
export type { SwitchProps };
