import type { ReactNode } from "react";

export type RenderableChildren<T> = (childProps: T) => ReactNode;
export type ComposedChildren = ReactNode;

export type Children<T> = RenderableChildren<T> | ComposedChildren;

export function renderChildren<T>(children: Children<T>, childProps: T) {
  if (typeof children === "function") {
    return children(childProps);
  }
  return children;
}
