import type { Key } from "react";

import { cn } from "@repo/ui/lib/class-merge";

import { variants } from "../control/option/option.component";

type CellProps = Omit<ComponentPropsWithoutRef<"div">, "id"> & {
  id: Key;
};
const Cell: React.FC<CellProps> = ({
  id,
  children,
  className,
  ...props
}: CellProps) => {
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
