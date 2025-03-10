import type { ReactNode } from "react";
import { createContext, useCallback, useContext } from "react";
import { useImmer } from "use-immer";

import type { Controllable } from "../../hooks/use-controllable.hook";
import type { ColumnDefinition } from "./column.component";
import type {
  DatatableColumn,
  DatatableContextType,
  DatatablePagination,
  DatatableSelection,
  DatatableSort,
} from "./datatable.context";
import { useControllable } from "../../hooks/use-controllable.hook";
import { DatatableContext } from "./datatable.context";

interface DatatableProps<TData extends object> {
  data: TData[];
  isLoading?: boolean;
  sortMode?: "single" | "multiple";
  selectionMode?: "single" | "multiple";

  sort?: Controllable<DatatableSort<TData>>;
  pagination?: Controllable<DatatablePagination>;
  selection?: Controllable<DatatableSelection>;

  children: ReactNode;
}

export const Datatable = <TData extends object>({
  children,
  sort = { defaultValue: [] },
  pagination = { defaultValue: { page: 1, size: 10 } },
  selection = { defaultValue: [] },
  ...props
}: DatatableProps<TData>) => {
  const [controlledSort, setControlledSort] =
    useControllable<DatatableSort<TData>>(sort);

  const [controlledPagination, setControlledPagination] =
    useControllable<DatatablePagination>(pagination);

  const [controlledSelection, setControlledSelection] =
    useControllable<DatatableSelection>(selection);

  const [columns, setColumns] = useImmer<Map<string, ColumnDefinition<TData>>>(
    new Map(),
  );

  const helpers = {
    registerColumn: useCallback(
      (column: ColumnDefinition<TData>) => {
        setColumns((draft) => {
          draft.set(column.id, column);
        });
      },
      [setColumns],
    ),
    onSortChange: setControlledSort,
    onPaginationChange: setControlledPagination,
    onSelectionChange: setControlledSelection,
  };

  const state = {
    data: props.data,
    isLoading: props.isLoading,
    sort: controlledSort,
    pagination: controlledPagination,
    selection: controlledSelection,
  };

  return (
    <DatatableContext.Provider value={{ state, helpers, columns }}>
      {children}
    </DatatableContext.Provider>
  );
};

export const createDatatable = <TData extends object>() => {
  const context = createContext<DatatableContextType<TData> | undefined>(
    undefined,
  );

  const useColumn = (column: ColumnDefinition<TData>) => {
    const { helpers } = useContext(context);

    const registerColumn = useCallback(
      (column: DatatableColumn<TData>) => {
        helpers.registerColumn(column);
      },
      [helpers],
    );

    return { registerColumn };
  };
};
