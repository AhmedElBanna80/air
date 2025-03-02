import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <SunIcon className="h-5 w-5 text-orange-500" />
      ) : (
        <MoonIcon className="h-5 w-5 text-blue-400" />
      )}
    </Button>
  );
} 