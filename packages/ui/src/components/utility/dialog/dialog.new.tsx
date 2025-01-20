import type { ComponentPropsWithRef } from "react";
import { useEffect, useRef } from "react";

import type { DialogContextValue } from "./dialog.context";
import { useDialog } from "./dialog.context";

type DialogProps = ComponentPropsWithRef<"dialog"> & {
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  modal?: boolean;
  children:
    | React.ReactNode
    | ((controls: DialogContextValue) => React.ReactNode);
};

const Dialog = ({
  children,
  modal = false,
  closeOnClickOutside = true,
  closeOnEscape = true,
  ...props
}: DialogProps) => {
  const controls = useDialog();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (controls.isOpen) {
      if (modal) {
        ref.current?.showModal();
      } else {
        ref.current?.show();
      }
    } else {
      ref.current?.close();
    }
  }, [modal, controls.isOpen]);

  return (
    <dialog
      {...props}
      ref={ref}
      onClick={(e) => {
        if (closeOnClickOutside && e.target === ref.current) {
          controls.close();
        }
        props.onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (closeOnEscape && e.key === "Escape") {
          controls.close();
        }
      }}
    >
      {typeof children === "function" ? children(controls) : children}
    </dialog>
  );
};

export type { DialogProps };
export { Dialog };
