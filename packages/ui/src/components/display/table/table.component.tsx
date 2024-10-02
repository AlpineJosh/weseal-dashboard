"use client";

import * as Aria from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

type TableProps = Aria.TableProps;

const variants = {
  table: {},
};

const Root = ({ className, children, ...props }: TableProps) => {
  return (
    <div className="flow-root">
      <div
        className={cn(
          className,
          "-mx-[--gutter] overflow-x-auto whitespace-nowrap",
        )}
      >
        <div
          className={cn(
            "inline-block min-w-full align-middle",
            "sm:px-[--gutter]",
          )}
        >
          <Aria.Table
            className="min-w-full text-left text-sm/6 text-content"
            {...props}
          >
            {children}
          </Aria.Table>
        </div>
      </div>
    </div>
  );
};

Root.displayName = "Table";

type TableHeaderProps<T extends object> = Aria.TableHeaderProps<T>;

const Header = <T extends object>({
  className,
  ...props
}: TableHeaderProps<T>) => (
  <Aria.TableHeader
    className={cn("text-content-muted", className)}
    {...props}
  />
);

Header.displayName = "Table.Header";

type TableBodyProps<T extends object> = Aria.TableBodyProps<T>;

const Body = <T extends object>({ className, ...props }: TableBodyProps<T>) => (
  <Aria.TableBody className={cn(className)} {...props} />
);
Body.displayName = "Table.Body";

type TableRowProps<T extends object> = Aria.RowProps<T>;

const Row = <T extends object>({ className, ...props }: TableRowProps<T>) => (
  <Aria.Row
    className={cn("border-b transition-colors", className)}
    {...props}
  />
);
Row.displayName = "Table.Row";

type TableColumnProps = Aria.ColumnProps;

const Column = ({ className, ...props }: TableColumnProps) => (
  <Aria.Column
    className={cn(
      "border-b border-b-content/10 px-4 py-2 font-medium first:pl-[var(--gutter,theme(spacing.2))] last:pr-[var(--gutter,theme(spacing.2))]",
      className,
    )}
    {...props}
  />
);
Column.displayName = "Table.Column";

type TableCellProps = Aria.CellProps;

const Cell = ({ className, ...props }: TableCellProps) => (
  <Aria.Cell
    className={cn(
      "relative px-4 py-2.5 first:pl-[var(--gutter,theme(spacing.2))] last:pr-[var(--gutter,theme(spacing.2))]",
      "border-b border-content/5",
      className,
    )}
    {...props}
  />
);
Cell.displayName = "Table.Cell";

export const Table = Object.assign(Root, {
  Header,
  Body,
  Row,
  Column,
  Cell,
});

export type {
  TableProps,
  TableBodyProps,
  TableColumnProps,
  TableRowProps,
  TableHeaderProps,
  TableCellProps,
};
