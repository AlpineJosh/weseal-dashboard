import type {
  Placement,
  UseClickProps,
  UseDismissProps,
  UseFloatingOptions,
  UseFocusProps,
  UseHoverProps,
  UseTransitionStatusProps,
  VirtualElement,
} from "@floating-ui/react";
import type { CSSProperties } from "react";
import { createContext, useContext } from "react";
import {
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useTransitionStatus,
} from "@floating-ui/react";

import { useControllable } from "../../../hooks/use-controllable.hook";

export type FloatingChildren =
  | React.ReactNode
  | ((controls: FloatingControls) => React.ReactNode);

interface FloatingControls {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

interface FloatingControlsProps {
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean | undefined) => void;
}

export const useFloatingControls = ({
  defaultOpen,
  isOpen,
  onOpenChange,
}: FloatingControlsProps): FloatingControls => {
  const [value, setValue] = useControllable({
    defaultValue: defaultOpen,
    value: isOpen,
    onChange: onOpenChange,
    requiresState: true,
  });

  return {
    isOpen: value ?? false,
    open: () => setValue(true),
    close: () => setValue(false),
    toggle: () => setValue((open) => !open),
    onOpenChange: setValue,
  };
};

interface FloatingContextType {
  placement: Placement | undefined;
  isMounted: boolean;
  transitionState: "unmounted" | "initial" | "open" | "close";
  controls: FloatingControls;
  reference: {
    setRef: (ref: Element | VirtualElement | null) => void;
    getProps: (
      props?: React.HTMLAttributes<HTMLElement>,
    ) => React.HTMLAttributes<HTMLElement>;
  };
  floating: {
    setRef: (ref: HTMLElement | null) => void;
    getProps: (
      props?: React.HTMLAttributes<HTMLElement>,
    ) => React.HTMLAttributes<HTMLElement>;
    styles: CSSProperties;
  };
}

const FloatingContext = createContext<FloatingContextType | undefined>(
  undefined,
);

export type FloatingProps = UseFloatingOptions & {
  hover?: UseHoverProps;
  click?: UseClickProps;
  focus?: UseFocusProps;
  dismiss?: UseDismissProps;
  transition?: UseTransitionStatusProps;
  children: FloatingChildren;
};

export const Floating = ({
  children,
  hover,
  click,
  focus,
  dismiss,
  transition,
  ...options
}: FloatingProps) => {
  const { context } = useFloating(options);

  const hoverInteractions = useHover(context, hover ?? { enabled: false });
  const clickInteractions = useClick(context, click ?? { enabled: false });
  const focusInteractions = useFocus(context, focus ?? { enabled: false });
  const dismissInteractions = useDismiss(
    context,
    dismiss ?? { enabled: false },
  );

  const interactions = useInteractions([
    hoverInteractions,
    clickInteractions,
    focusInteractions,
    dismissInteractions,
  ]);

  const { isMounted, status } = useTransitionStatus(context, transition);

  const controls = {
    isOpen: context.open,
    open: () => context.onOpenChange(true),
    close: () => context.onOpenChange(false),
    toggle: () => context.onOpenChange(!context.open),
    onOpenChange: context.onOpenChange,
  };

  return (
    <FloatingContext.Provider
      value={{
        placement: options.placement,
        isMounted,
        transitionState: status,
        controls,
        reference: {
          setRef: (ref: Element | VirtualElement | null) =>
            context.refs.setReference(ref),
          getProps: interactions.getReferenceProps,
        },
        floating: {
          setRef: (ref: HTMLElement | null) => context.refs.setFloating(ref),
          getProps: interactions.getFloatingProps,
          styles: context.floatingStyles,
        },
      }}
    >
      {typeof children === "function" ? children(controls) : children}
    </FloatingContext.Provider>
  );
};

export const useFloatingProps = () => {
  const context = useContext(FloatingContext);

  if (!context) {
    throw new Error("FloatingContext not found");
  }

  return {
    controls: context.controls,
    placement: context.placement,
    isMounted: context.isMounted,
    transitionState: context.transitionState,
    ...context.floating,
  };
};

export const useReferenceProps = () => {
  const context = useContext(FloatingContext);

  if (!context) {
    throw new Error("FloatingContext not found");
  }

  return {
    controls: context.controls,
    ...context.reference,
  };
};
