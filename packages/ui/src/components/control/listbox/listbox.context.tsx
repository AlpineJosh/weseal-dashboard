import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

interface ListboxContextType<TValue> {
  selectedValue?: TValue;
  setSelectedValue: (value?: TValue) => void;
  highlightedValue?: TValue;
  setHighlightedValue: (value?: TValue) => void;
}

export const ListboxContext = createContext<ListboxContextType<unknown> | null>(
  null,
);

export const useListbox = <TValue,>() => {
  const context = useContext(ListboxContext);
  if (!context) {
    throw new Error("useListbox must be used within a Listbox");
  }
  return context as ListboxContextType<TValue>;
};

export const ListboxProvider = <TValue,>({
  children,
  ...props
}: PropsWithChildren<ListboxContextType<TValue>>) => {
  return (
    <ListboxContext.Provider value={props as ListboxContextType<unknown>}>
      {children}
    </ListboxContext.Provider>
  );
};
