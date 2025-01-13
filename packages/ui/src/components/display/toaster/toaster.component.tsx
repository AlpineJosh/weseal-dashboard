import { useCallback, useState } from "react";
import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";

import { faXmark } from "@repo/pro-solid-svg-icons";

import type { Toast, ToastContextType } from "./types";
import { Button, Icon } from "../../element";
import { ToastContext } from "./toaster.context";

const variants = cva(
  [
    "mb-2 flex items-center justify-between space-x-2 rounded-lg p-3 pl-4 pr-2 text-sm font-medium shadow-lg",
  ],
  {
    variants: {
      type: {
        success: "bg-primary text-white",
        error: "bg-destructive text-white",
        warning: "bg-secondary text-white",
        info: "bg-background-popover",
      },
    },
  },
);

const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={variants({ type: toast.type })}
    >
      <p>{toast.message}</p>
      <Button variant="plain" onPress={() => onRemove(toast.id)}>
        <Icon icon={faXmark} />
      </Button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    ({ message, type, duration = 5000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, message, type, duration };

      setToasts((currentToasts) => [...currentToasts, newToast]);

      if (duration) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const contextValue: ToastContextType = {
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed right-4 top-4 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
