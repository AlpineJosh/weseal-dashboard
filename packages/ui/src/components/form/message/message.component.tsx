import { cn } from "@repo/ui/lib/class-merge";

import type { TextProps } from "../../typography";
import { Text } from "../../typography";
import { useMessage } from "./message.hook";

export const Message = ({ id, className, children, ...props }: TextProps) => {
  const { props: messageProps, error } = useMessage(id);

  return (
    <Text
      data-slot="message"
      {...messageProps}
      {...props}
      className={cn(
        "text-xs font-medium text-content-muted invalid:text-destructive",
        className,
      )}
    >
      {error?.message ?? children}
    </Text>
  );
};
Message.displayName = "Field.Message";
