// import { Toaster } from "@repo/ui/toast";

import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/utils/trpc/react";
import { ThemeProvider } from "next-themes";

import { cn } from "@repo/ui";

import "@repo/tailwind-config/globals.css";

import { ClientProviders } from "@/components/provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
      <body
        className={cn(inter.variable, "min-h-screen font-sans antialiased")}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <TRPCReactProvider>
            <ClientProviders>{props.children}</ClientProviders>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
