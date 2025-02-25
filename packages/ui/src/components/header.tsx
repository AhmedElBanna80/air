"use client";

import { Menu } from "lucide-react";

import { Button } from "./button.js";
import { ModeToggle } from "./mode-toggle.js";
import { useSidebar } from "../../../../apps/web/components/sidebar-context.js";

export function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <h1 className="text-2xl font-bold">Air Quality Analysis</h1>
      </div>
      <ModeToggle />
    </header>
  );
}
