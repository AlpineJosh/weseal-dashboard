const baseColors = {
  red: "[--color:--color-red] [--color-border:--color-red-border] [--color-text:--color-red-text]",
  orange:
    "[--color:--color-orange] [--color-border:--color-orange-border] [--color-text:--color-orange-text]",
  amber:
    "[--color:--color-amber] [--color-border:--color-amber-border] [--color-text:--color-amber-text]",
  yellow:
    "[--color:--color-yellow] [--color-border:--color-yellow-border] [--color-text:--color-yellow-text]",
  lime: "[--color:--color-lime] [--color-border:--color-lime-border] [--color-text:--color-lime-text]",
  green:
    "[--color:--color-green] [--color-border:--color-green-border] [--color-text:--color-green-text]",
  emerald:
    "[--color:--color-emerald] [--color-border:--color-emerald-border] [--color-text:--color-emerald-text]",
  teal: "[--color:--color-teal] [--color-border:--color-teal-border] [--color-text:--color-teal-text]",
  cyan: "[--color:--color-cyan] [--color-border:--color-cyan-border] [--color-text:--color-cyan-text]",
  sky: "[--color:--color-sky] [--color-border:--color-sky-border] [--color-text:--color-sky-text]",
  blue: "[--color:--color-blue] [--color-border:--color-blue-border] [--color-text:--color-blue-text]",
  indigo:
    "[--color:--color-indigo] [--color-border:--color-indigo-border] [--color-text:--color-indigo-text]",
  violet:
    "[--color:--color-violet] [--color-border:--color-violet-border] [--color-text:--color-violet-text]",
  purple:
    "[--color:--color-purple] [--color-border:--color-purple-border] [--color-text:--color-purple-text]",
  fuchsia:
    "[--color:--color-fuchsia] [--color-border:--color-fuchsia-border] [--color-text:--color-fuchsia-text]",
  pink: "[--color:--color-pink] [--color-border:--color-pink-border] [--color-text:--color-pink-text]",
  rose: "[--color:--color-rose] [--color-border:--color-rose-border] [--color-text:--color-rose-text]",
  zinc: "[--color:--color-zinc] [--color-border:--color-zinc-border] [--color-text:--color-zinc-text]",
};

export const colorVariants = {
  default:
    "[--color:--content] [--color-border:--content] [--color-text:--background]",
  primary: baseColors.blue,
  secondary: baseColors.lime,
  destructive: baseColors.red,
  warning: baseColors.yellow,
  success: baseColors.green,
  info: baseColors.sky,
  ...baseColors,
};

export type ColorVariants = keyof typeof colorVariants;
