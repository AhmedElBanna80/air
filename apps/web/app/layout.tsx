import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@workspace/ui/globals.css";
import { ThemeProvider } from "@/components/providers";
import { SidebarProvider } from "@workspace/ui/components/sidebar-context";
import { Header } from "@workspace/ui/components/header";
import { Sidebar } from "@workspace/ui/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Air Quality Analysis",
  description: "Analyze and visualize air quality data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
