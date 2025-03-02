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

  // Handle clicks outside the sidebar to close it on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        window.innerWidth < 1024 &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity lg:hidden z-10 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
        tabIndex={0}
        role="button"
        aria-label="Close menu"
      />

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-200 ease-in-out bg-sidebar overflow-y-auto lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 border-b border-sidebar-border flex items-center px-6">
          <Link to="/" className="flex items-center space-x-2">
            <BarChart3Icon className="h-6 w-6 text-sidebar-foreground" />
            <span className="font-bold text-xl text-sidebar-foreground">Air Quality Analysis</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden absolute top-4 right-4"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === 'Enter' && setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
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
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}