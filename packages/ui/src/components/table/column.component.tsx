import type { ReactNode } from "react";

import type { DatatableCellRenderProps } from "./datatable.context";
import { useId } from "../../hooks/use-id.hook";

type ColumnWidth = string | { min: string; max: string };

type ColumnSort<TData> =
  | keyof TData
  | ((data: TData) => string | number)
  | undefined;

interface ColumnProps<TData extends object> {
  id?: string;
  label?: string;
  hidden?: boolean;
  width?: ColumnWidth;
  sort?: ColumnSort<TData>;
  order?: number;
  children: ReactNode | ((props: DatatableCellRenderProps<TData>) => ReactNode);
}

export interface ColumnDefinition<TData extends object> {
  id: string;
  label?: string;
  hidden?: boolean;
  width?: ColumnWidth;
  sort?: ColumnSort<TData>;
  order?: number;
  cell: ReactNode | ((props: DatatableCellRenderProps<TData>) => ReactNode);
}

export const createColumn = <TData extends object>(
  registerColumn: (column: ColumnDefinition<TData>) => void,
) => {
  const Column = ({ id, children, ...props }: ColumnProps<TData>) => {
    id = useId(id);

    registerColumn({
      id,
      cell: children,
      ...props,
    });

    return null;
  };

  return Column;
};
