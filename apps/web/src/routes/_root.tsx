import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Link, Outlet } from '@tanstack/react-router';
import {
    BarChart3Icon,
    CalendarIcon,
    HomeIcon,
    MenuIcon,
    SettingsIcon,
    UploadIcon,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

export function RootComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [sidebarOpen]);

  // Close sidebar when window resizes to larger viewport
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };

    // Set initial state based on viewport size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={cn(
          "fixed lg:static left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-40",
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3Icon className="h-6 w-6 text-sidebar-foreground" />
            <h1 className="text-xl font-bold text-sidebar-foreground">Air Quality Analysis</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-6 px-4 space-y-1">
          <Link
            to="/"
            activeProps={{
              className: 'bg-sidebar-accent text-sidebar-accent-foreground',
            }}
            className={cn(
              "flex items-center p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            )}
            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
          >
            <HomeIcon className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link
            to="/charts"
            activeProps={{
              className: 'bg-sidebar-accent text-sidebar-accent-foreground',
            }}
            className={cn(
              "flex items-center p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            )}
            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
          >
            <BarChart3Icon className="mr-3 h-5 w-5" />
            Charts
          </Link>
          <Link
            to="/date-range"
            activeProps={{
              className: 'bg-sidebar-accent text-sidebar-accent-foreground',
            }}
            className={cn(
              "flex items-center p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            )}
            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
          >
            <CalendarIcon className="mr-3 h-5 w-5" />
            Date Range
          </Link>
          <Link
            to="/settings"
            activeProps={{
              className: 'bg-sidebar-accent text-sidebar-accent-foreground',
            }}
            className={cn(
              "flex items-center p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            )}
            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
          >
            <SettingsIcon className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}