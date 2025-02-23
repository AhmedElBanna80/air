import { ModeToggle } from "./mode-toggle.js";

export function Header() {
    return (
        <header className="flex items-center justify-between border-b px-6 py-4">
            <h1 className="text-2xl font-bold">Air Quality Analysis</h1>
            <ModeToggle />
        </header>
    );
}
