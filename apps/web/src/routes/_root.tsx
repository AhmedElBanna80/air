import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Link, Outlet } from '@tanstack/react-router';
import {
    BarChart3Icon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on initial render
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  // Handle clicks outside the sidebar to close it on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        isMobile &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen, isMobile]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile, close the sidebar
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Toggle sidebar on desktop
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Determine if sidebar should be visible
  const isSidebarVisible = isMobile ? sidebarOpen : !sidebarCollapsed;

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
        className={`fixed inset-y-0 left-0 z-20 transform transition-all duration-200 ease-in-out bg-sidebar overflow-y-auto ${
          isMobile 
            ? sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64' 
            : sidebarCollapsed ? 'w-16' : 'w-64'
        } ${isMobile ? '' : 'relative'}`}
      >
        <div className={`h-16 border-b border-sidebar-border flex items-center ${sidebarCollapsed && !isMobile ? 'justify-center' : 'px-6'}`}>
          {(!sidebarCollapsed || isMobile) && (
            <Link to="/" className="flex items-center space-x-2">
              <BarChart3Icon className="h-6 w-6 text-sidebar-foreground" />
              <span className="font-bold text-xl text-sidebar-foreground">Air Quality</span>
            </Link>
          )}
          {sidebarCollapsed && !isMobile && (
            <BarChart3Icon className="h-6 w-6 text-sidebar-foreground" />
          )}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4"
              onClick={() => setSidebarOpen(false)}
              onKeyDown={(e) => e.key === 'Enter' && setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`mt-6 ${sidebarCollapsed && !isMobile ? 'px-2' : 'px-4'} space-y-1`}>
          <Link
            to="/"
            activeProps={{
              className: 'bg-sidebar-accent text-sidebar-accent-foreground',
            }}
            className={cn(
              "flex items-center p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              sidebarCollapsed && !isMobile && "justify-center px-2"
            )}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <HomeIcon className={cn("h-5 w-5", !sidebarCollapsed || isMobile ? "mr-3" : "")} />
            {(!sidebarCollapsed || isMobile) && "Dashboard"}
          </Link>
          <Link
            to="/charts"
            activeProps={{
              className: 'bg-sidebar-accent text-sidebar-accent-foreground',
            }}
            className={cn(
              "flex items-center p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              sidebarCollapsed && !isMobile && "justify-center px-2"
            )}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <BarChart3Icon className={cn("h-5 w-5", !sidebarCollapsed || isMobile ? "mr-3" : "")} />
            {(!sidebarCollapsed || isMobile) && "Charts"}
          </Link>
          <Link
            to="/date-range"
            activeProps={{
              className: 'bg-sidebar-accent text-sidebar-accent-foreground',
            }}
            className={cn(
              "flex items-center p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              sidebarCollapsed && !isMobile && "justify-center px-2"
            )}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <CalendarIcon className={cn("h-5 w-5", !sidebarCollapsed || isMobile ? "mr-3" : "")} />
            {(!sidebarCollapsed || isMobile) && "Date Range"}
          </Link>
          <Link
            to="/settings"
            activeProps={{
              className: 'bg-sidebar-accent text-sidebar-accent-foreground',
            }}
            className={cn(
              "flex items-center p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              sidebarCollapsed && !isMobile && "justify-center px-2"
            )}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <SettingsIcon className={cn("h-5 w-5", !sidebarCollapsed || isMobile ? "mr-3" : "")} />
            {(!sidebarCollapsed || isMobile) && "Settings"}
          </Link>
        </nav>

        {/* Collapse toggle for desktop */}
        {!isMobile && (
          <div className={cn(
            "absolute bottom-4",
            sidebarCollapsed ? "right-1/2 translate-x-1/2" : "right-4"
          )}>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              onKeyDown={(e) => e.key === 'Enter' && setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "flex items-center p-3 rounded-lg bg-sidebar-accent bg-opacity-10 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                sidebarCollapsed && "justify-center w-10 h-10 p-0"
              )}
            >
              {sidebarCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
            </Button>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
            aria-label={isMobile 
              ? "Open menu" 
              : sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className={!isMobile && !sidebarCollapsed ? "invisible" : ""}
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