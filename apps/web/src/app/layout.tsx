// import { Toaster } from "@repo/ui/toast";

import type { Viewport } from "next";
import { Inter } from "next/font/google";

import { cn } from "@repo/ui";
import { ThemeProvider } from "@repo/ui/components/theme/theme-provider";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
