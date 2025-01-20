import { cn } from "@repo/ui/lib/class-merge";

import type { TextProps } from "../../typography";
import { Text } from "../../typography";
import { useDescription } from "./description.hook";

const Description = ({ id, className, ...props }: TextProps) => {
  const descriptionProps = useDescription(id);

  return (
    <Text
      data-slot="description"
      {...descriptionProps}
      {...props}
      className={cn("text-xs text-content-muted", className)}
    />
  );
};
Description.displayName = "Field.Description";

export { Description };
