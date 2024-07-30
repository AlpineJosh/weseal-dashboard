import type { ReactNode } from "react";

export type Children<T> = ReactNode | ((childProps: T) => ReactNode);

export function renderChildren<T>(children: Children<T>, childProps: T) {
  if (typeof children === "function") {
    return children(childProps);
  }
  return children;
}
