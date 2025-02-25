"use client";

import { BarChart2, Calendar, Home, Settings, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "../../../packages/ui/src/components/button.js";
import { useSidebar } from "./sidebar-context.jsx";

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        document.body.classList.remove("sidebar-open");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-100 p-4 transition-transform duration-300 ease-in-out dark:bg-gray-800 md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 md:hidden"
          onClick={toggleSidebar}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close sidebar</span>
        </Button>
        <nav className="space-y-2 pt-16 md:pt-0">
          <Link
            href="/"
            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/charts"
            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            <BarChart2 size={20} />
            <span>Charts</span>
          </Link>
          <Link
            href="/date-range"
            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            <Calendar size={20} />
            <span>Date Range</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        >
        </div>
      )}
    </>
  );
}
