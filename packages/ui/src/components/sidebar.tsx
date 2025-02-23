import Link from "next/link";
import { BarChart2, Calendar, Home, Settings } from "lucide-react";

export function Sidebar() {
    return (
        <aside className="w-64 border-r bg-gray-100 p-4 dark:bg-gray-800">
            <nav className="space-y-2">
                <Link
                    href="/"
                    className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    <Home size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link
                    href="/charts"
                    className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    <BarChart2 size={20} />
                    <span>Charts</span>
                </Link>
                <Link
                    href="/date-range"
                    className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    <Calendar size={20} />
                    <span>Date Range</span>
                </Link>
                <Link
                    href="/settings"
                    className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>
            </nav>
        </aside>
    );
}
