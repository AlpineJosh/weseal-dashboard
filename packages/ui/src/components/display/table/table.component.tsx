"use client";

import type {
  ComponentPropsWithoutRef,
  Key,
  ReactElement,
  ReactNode,
} from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { cva } from "class-variance-authority";
import * as Aria from "react-aria-components";
import { useImmer } from "use-immer";

import {
  faAngleDown,
  faAnglesUpDown,
  faAngleUp,
} from "@repo/pro-light-svg-icons";
import { cn } from "@repo/ui/lib/class-merge";

import { Checkbox } from "../../control";
import { Icon } from "../../element";

const variants = {
  table: cva("flex min-w-full flex-col text-sm/6 lg:grid"),
  head: cva("hidden lg:contents"),
  column: cva(
    "border-content/5 px-2 py-1 font-light text-content-muted lg:border-b lg:px-4 lg:py-2.5",
    {
      variants: {
        sortable: {
          true: "flex appearance-none flex-row items-center justify-between text-left outline-none hover:bg-content/5",
        },
      },
    },
  ),
  body: cva("flex flex-col lg:contents"),
  row: cva(
    "grid grid-cols-[auto_1fr] border-b border-content/5 px-2 py-4 lg:contents lg:py-2",
  ),
  cell: cva(
    "truncate border-content/5 px-2 py-1 lg:border-b lg:px-4 lg:py-2.5",
    {
      variants: {
        selectable: {
          true: "hover:bg-content/5",
        },
      },
    },
  ),
};

type SortDirection = "asc" | "desc" | undefined;

interface ColumnSort {
  key: Key;
  direction: SortDirection;
}

type TableSort = {
  sortMode?: "single" | "multiple";
  sortValue?: ColumnSort | ColumnSort[];
  defaultSortValue?: ColumnSort | ColumnSort[];
  onSortChange?: (...columns: ColumnSort[]) => void;
} & (
  | {
      sortMode?: "single";
      sortValue?: ColumnSort;
      defaultSortValue?: ColumnSort;
    }
  | {
      sortMode?: "multiple";
      sortValue?: ColumnSort[];
      defaultSortValue?: ColumnSort[];
    }
);

interface SortContextValue {
  mode: "single" | "multiple";
  value: ColumnSort[];
  handleSort: (key: Key) => void;
}

type SelectionMode = "single" | "multiple";

interface TableContextValue {
  columns: ColumnDefinition[];
  registerColumn: (column: ColumnDefinition) => void;
  unregisterColumn: (id: Key) => void;
  sort: SortContextValue;
  selectionMode?: SelectionMode;
}

const TableContext = createContext<TableContextValue>({
  columns: [],
  registerColumn: () => void 0,
  unregisterColumn: () => void 0,
  sort: {
    mode: "multiple",
    value: [],
    handleSort: () => void 0,
  },
});

const useTable = () => {
  return useContext(TableContext);
};

type TableProps = Omit<ComponentPropsWithoutRef<"div">, "children"> &
  TableSort & {
    selectionMode?: SelectionMode;
    children: [ReactElement<HeadProps>, ReactElement<BodyProps<unknown>>];
  };

const Root = ({
  children,
  className,
  sortMode = "multiple",
  sortValue,
  defaultSortValue,
  onSortChange,
  ...props
}: TableProps) => {
  const [columns, setColumns] = useImmer<ColumnDefinition[]>([]);

  const [internalSort, setInternalSort] = useImmer<ColumnSort[]>(
    defaultSortValue
      ? sortMode === "single"
        ? [defaultSortValue as ColumnSort]
        : (defaultSortValue as ColumnSort[])
      : [],
  );

  const currentSort = useMemo(
    () =>
      sortValue !== undefined
        ? sortMode === "single"
          ? [sortValue as ColumnSort]
          : (sortValue as ColumnSort[])
        : internalSort,
    [sortValue, sortMode, internalSort],
  );

  const handleSortChange = useCallback(
    (key: Key) => {
      const newSort = (draft: ColumnSort[]) => {
        const columnIndex = draft.findIndex((col) => col.key === key);
        if (columnIndex >= 0) {
          if (draft[columnIndex]?.direction === "asc") {
            draft[columnIndex].direction = "desc";
          } else {
            draft.splice(columnIndex, 1);
          }
        } else {
          if (sortMode === "single") {
            draft.splice(0, draft.length, { key, direction: "asc" });
          } else {
            draft.push({ key, direction: "asc" });
          }
        }
      };

      if (sortValue === undefined) {
        // Uncontrolled: update internal state
        setInternalSort(newSort);
      }

      // Notify parent of change regardless of controlled/uncontrolled
      if (onSortChange) {
        // Create a new array and apply the same sort logic
        const nextSort = [...currentSort];
        newSort(nextSort);

        onSortChange(...nextSort);
      }
    },
    [sortMode, sortValue, currentSort, onSortChange, setInternalSort],
  );

  const registerColumn = useCallback(
    (column: ColumnDefinition) => {
      setColumns((draft) => {
        draft.push(column);
      });
    },
    [setColumns],
  );

  const unregisterColumn = useCallback(
    (id: Key) => {
      setColumns((draft) => {
        draft.splice(
          draft.findIndex((column) => column.id === id),
          1,
        );
      });
    },
    [setColumns],
  );

  const columnSizes = useMemo(() => {
    const sizes: string[] = [];

    columns.forEach(({ width }) => {
      if (!width) {
        sizes.push("minmax(50px, 1fr)");
      } else if (typeof width === "string") {
        sizes.push(width);
      }
    });

    return sizes;
  }, [columns]);

  return (
    <TableContext.Provider
      value={{
        columns,
        registerColumn,
        unregisterColumn,
        sort: {
          mode: sortMode,
          value: currentSort,
          handleSort: handleSortChange,
        },
      }}
    >
      <div
        {...props}
        className={cn(variants.table(), className)}
        style={{
          gridTemplateColumns: columnSizes.join(" "),
        }}
      >
        {children}
      </div>
    </TableContext.Provider>
  );
};

type HeadProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  children: ReactElement<ColumnProps>[];
};

const Head: React.FC<HeadProps> = ({ children, className, ...props }) => {
  const { selectionMode } = useTable();
  return (
    <div className={cn(variants.head(), className)} {...props}>
      {selectionMode && (
        <Column id="selection">
          {selectionMode === "multiple" ? <Checkbox /> : null}
        </Column>
      )}
      {children}
    </div>
  );
};

type ColumnWidth = string | { min: string; max: string };

interface ColumnDefinition {
  id: Key;
  hidden?: boolean;
  width?: ColumnWidth;
  sort?: ColumnSort;
  Node: ReactNode;
}

const useColumn = (column: ColumnDefinition) => {
  const { registerColumn, unregisterColumn, sort } = useTable();

  useEffect(() => {
    registerColumn(column);
    return () => unregisterColumn(column.id);
  }, [column, registerColumn, unregisterColumn]);

  const handleSort = useCallback(
    () => sort.handleSort(column.id),
    [sort, column.id],
  );

  const direction = sort.value.find(
    (sort) => sort.key === column.id,
  )?.direction;

  return {
    sort: {
      mode: sort.mode,
      direction,
      handleSort,
    },
  };
};

interface ColumnProps {
  id: Key;
  hidden?: boolean;
  width?: ColumnWidth;
  isSortable?: boolean;
  children: ReactNode;
  className?: string;
}

const Column: React.FC<ColumnProps> = ({
  id,
  hidden,
  width,
  isSortable,
  className,
  children,
}) => {
  const column = useMemo(
    () => ({ id, hidden, width, isSortable, Node: children }),
    [id, hidden, width, isSortable, children],
  );

  const { sort } = useColumn(column);

  return isSortable ? (
    <Aria.Button
      className={cn(
        variants.column({ sortable: true }),
        "space-x-2",
        className,
      )}
      onPress={sort.handleSort}
    >
      <span className="truncate">{children}</span>
      <Icon
        icon={
          sort.direction === undefined
            ? faAnglesUpDown
            : sort.direction === "asc"
              ? faAngleDown
              : faAngleUp
        }
      />
    </Aria.Button>
  ) : (
    <div className={cn(variants.column(), className)}>{children}</div>
  );
};

interface BodySelection<TData> {
  selectedValues?: TData[];
  onSelectionChange?: (selectedValues: TData[]) => void;
}

type BodyProps<TData> = Omit<ComponentPropsWithoutRef<"div">, "children"> &
  BodySelection<TData> & {
    data?: TData[];
    children: (props: RowRenderProps<TData>) => ReactElement<RowProps>;
  };

const Body = <TData,>({
  data,
  children,
  className,
  ...props
}: BodyProps<TData>) => {
  return (
    <div {...props} className={cn(variants.body(), className)}>
      {data?.map((value) => children({ data: value, isSelected: false }))}
    </div>
  );
};

interface RowRenderProps<TData> {
  data: TData;
  isSelected: boolean;
}

type RowProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  children: ReactElement<CellProps>[];
};

const Row = ({ children, className, ...props }: RowProps) => {
  return (
    <div {...props} className={cn(variants.row(), className)}>
      {children}
    </div>
  );
};

const useCell = (key: Key) => {
  const { columns } = useTable();
  const column = columns.find((column) => column.id === key);
  return { column };
};

type CellProps = ComponentPropsWithoutRef<"div"> & {
  id: Key;
};
const Cell: React.FC<CellProps> = ({ id, children, className, ...props }) => {
  const { column } = useCell(id);

  if (!column) {
    return null;
  }

  return (
    <>
      <div className={cn("block lg:hidden", variants.column())}>
        {column.Node}
      </div>
      <div {...props} className={cn(variants.cell(), className)}>
        {children}
      </div>
    </>
  );
};

export const Table = Object.assign(Root, {
  Head,
  Column,
  Body,
  Row,
  Cell,
});
export type {
  TableProps,
  ColumnProps,
  RowProps,
  CellProps,
  BodyProps,
  ColumnSort,
};
