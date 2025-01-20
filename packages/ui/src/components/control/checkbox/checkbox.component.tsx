import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { faCheck } from "@repo/pro-solid-svg-icons";
import { cn } from "@repo/ui/lib/class-merge";
import { colorVariants } from "@repo/ui/lib/colors";

import type { ControlInputProps, InputProps } from "../types";
import { Icon } from "../../element";
import { Control } from "../../form/control/control.component";
import { useControllable } from "../../utility/hooks/useControllable.hook";

const variants = cva(
  [
    // Basic layout
    "relative isolate flex size-4 flex-row items-center justify-center rounded-sm text-transparent",
    // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
    "before:absolute before:inset-0 before:-z-10 before:rounded-sm before:bg-background before:shadow",
    // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
    "dark:bg-content/5 dark:before:hidden",
    // Border
    "border border-content/15 hover:border-content/30",
    // Inner highlight shadow
    "after:absolute after:inset-0 after:rounded-sm after:shadow-[inset_0_1px_theme(colors.white/15%)]",
    "dark:after:-inset-px dark:after:hidden dark:after:rounded-sm",

    "has-[:checked:disabled]:ark:after:hidden has-[:checked]:border-transparent has-[:checked]:bg-color-border has-[:checked]:text-background has-[:checked]:before:bg-color has-[:checked]:dark:bg-color has-[:checked]:dark:after:block",
    // Focus ring
    "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
    // Disabled state
    "has-[:disabled]:bg-white/[2.5%] has-[:disabled]:opacity-50 has-[:disabled]:group-data-[selected]:after:hidden",
  ],
  {
    variants: {
      color: colorVariants,
    },
    defaultVariants: {
      color: "primary",
    },
  },
);

type CheckboxProps = ControlInputProps<boolean> & VariantProps<typeof variants>;

const Checkbox = ({
  value,
  onChange,
  defaultValue = false,
  ...props
}: CheckboxProps) => {
  const [checked, setChecked] = useControllable({
    value,
    onChange,
    defaultValue,
  });

  return (
    <Control {...props}>
      <Icon icon={faCheck} className="size-3" />
      <input
        type="checkbox"
        className="absolute inset-0 z-10 opacity-0"
        checked={!!checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
    </Control>
  );
};

export { Checkbox };
export type { CheckboxProps };
