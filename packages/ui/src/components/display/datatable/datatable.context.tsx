import React, { createContext, PropsWithChildren, useContext } from "react";
import * as Aria from "react-aria-components";
import { useImmer } from "use-immer";

type DatatableContextType<TData extends object> = {
  rows: TData[];
  isLoading: boolean;
  pagination: {
    page: number;
    size: number;
    total?: number;
  };
  selection?: {
    mode: "none" | "single" | "multiple";
    behaviour: "replace" | "toggle" | null;
    selectedKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
  };
};

const DatatableContext = createContext<DatatableContextType<any> | undefined>(
  undefined,
);

type DatatableProviderProps<TData extends object> = PropsWithChildren<
  Omit<DatatableContextType<TData>, "selection">
>;

const DatatableProvider = <TData extends object>({
  children,
  ...props
}: DatatableProviderProps<TData>) => {
  const [context, setContext] = useImmer<DatatableContextType<TData>>({
    rows: [],
    isLoading: true,
    pagination: {
      page: 1,
      size: 10,
    },
  });

  const { selectionBehavior = null, selectionMode = "none" } =
    Aria.useTableOptions();

  return (
    <DatatableContext.Provider
      value={{
        ...context,
        selection: {
          mode: selectionMode,
          behaviour: selectionBehavior,
        },
        ...props,
      }}
    >
      {children}
    </DatatableContext.Provider>
  );
};

const useDatatableContext = () => {
  return useContext(DatatableContext);
};

export { DatatableContext, DatatableProvider, useDatatableContext };
