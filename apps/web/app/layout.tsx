import { Inter } from "next/font/google";

import { Providers } from "@/components/providers";
import "@workspace/ui/globals.css";
import { Header } from "@workspace/ui/components/header";
import { Sidebar } from "@workspace/ui/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
              <Providers>
                {children}
              </Providers>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
