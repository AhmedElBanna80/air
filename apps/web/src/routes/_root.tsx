import { Link, Outlet } from '@tanstack/react-router';
import {
    BarChart3Icon,
    HomeIcon,
    UploadIcon
} from 'lucide-react';
import { cn } from '../lib/utils';



export function RootComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <BarChart3Icon className="h-6 w-6" />
              <span className="inline-block font-bold">Air Quality Dashboard</span>
            </Link>
            <nav className="flex gap-6">
              <Link
                to="/"
                activeProps={{
                  className: 'text-primary font-bold',
                }}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary"
                )}
              >
                <HomeIcon className="mr-1 h-4 w-4" />
                Home
              </Link>
              <Link
                to="/charts"
                activeProps={{
                  className: 'text-primary font-bold',
                }}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary"
                )}
              >
                <BarChart3Icon className="mr-1 h-4 w-4" />
                Charts
              </Link>
              <Link
                to="/upload"
                activeProps={{
                  className: 'text-primary font-bold',
                }}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary"
                )}
              >
                <UploadIcon className="mr-1 h-4 w-4" />
                Upload Data
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Air Quality Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}