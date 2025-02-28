import type { ComponentPropsWithRef } from "react";
import { useMemo } from "react";
import { FloatingOverlay, FloatingPortal } from "@floating-ui/react";
import { cva } from "class-variance-authority";

import type { FloatingChildren } from "../floating/floating.context";
import { useFloatingProps } from "../floating/floating.context";

const backdropStyles = cva([
  "fixed inset-0 isolate z-10 flex w-screen justify-center overflow-y-auto px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-16",
  "bg-content/25 dark:bg-background/50",
  "ending:ease-out ending:opacity-100 transition duration-100 ease-in focus:outline-0 starting:opacity-0",
]);

export type PaneProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  children: FloatingChildren;
  showBackdrop?: boolean;
  lockScroll?: boolean;
};

export const Pane = ({
  children,
  className,
  showBackdrop = true,
  lockScroll = true,
  ...props
}: PaneProps) => {
  const {
    controls,
    getProps,
    setRef,
    styles,
    isMounted,
    placement,
    transitionState,
  } = useFloatingProps();

  const PaneElement = useMemo(
    () => (
      <div {...getProps()} ref={setRef} style={styles} className="z-20">
        <div
          data-ending={transitionState === "close"}
          data-placement={placement}
          className={className}
          {...props}
        >
          {typeof children === "function" ? children(controls) : children}
        </div>
      </div>
    ),
    [
      getProps,
      setRef,
      styles,
      placement,
      className,
      props,
      children,
      controls,
      transitionState,
    ],
  );

  return !isMounted ? null : (
    <FloatingPortal>
      {showBackdrop ? (
        <FloatingOverlay
          data-ending={transitionState === "close"}
          lockScroll={lockScroll}
          className={backdropStyles()}
        >
          {PaneElement}
        </FloatingOverlay>
      ) : (
        PaneElement
      )}
    </FloatingPortal>
  );
};
