import { ReactNode } from "react";

export default function FlowLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-screen-sm">{children}</div>
    </div>
  );
}
