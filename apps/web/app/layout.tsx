import type React from "react";

import "@workspace/ui/globals.css";
import { Inter } from "next/font/google";

import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar-context";
import { Header } from "@workspace/ui/components/header";
import { ThemeProvider } from "@workspace/ui/components/providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex h-screen flex-col">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
