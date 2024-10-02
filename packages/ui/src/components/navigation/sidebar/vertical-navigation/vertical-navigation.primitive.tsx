"use client"

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

const Root = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  (props, ref) => {
    return <div ref={ref} {...props} />;
  },
);

export default { Root };