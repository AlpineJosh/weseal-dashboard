import type { ComponentPropsWithRef } from "react";
import { useEffect } from "react";

import { cn } from "@repo/ui/lib/class-merge";

import type { OverlayChildren } from "../overlay/overlay.component";
import { useOverlay } from "../overlay/overlay.context";

export type SheetProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  children: OverlayChildren;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
};

export const Sheet = ({
  children,
  className,
  closeOnClickOutside = true,
  closeOnEscape = true,
  ...props
}: SheetProps) => {
  const { isModal, controls, sheet } = useOverlay();

  useEffect(() => {
    if (controls.isOpen) {
      if (isModal) {
        sheet.ref.current?.showModal();
      } else {
        sheet.ref.current?.show();
      }
    } else {
      sheet.ref.current?.close();
    }
  }, [isModal, controls.isOpen, sheet.ref]);

  const handleClick = (e: React.MouseEvent) => {
    if (closeOnClickOutside && e.target === sheet.ref.current) {
      controls.close();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (closeOnEscape && e.key === "Escape") {
      controls.close();
      e.preventDefault();
    }
  };

  return (
    <dialog
      ref={sheet.setReference}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(sheet.className, className, "[&::backdrop]:bg-black/50")}
      style={sheet.styles}
    >
      <div {...props}>
        {typeof children === "function" ? children(controls) : children}
      </div>
    </dialog>
  );
};
