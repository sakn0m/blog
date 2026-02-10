"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevents hydration mismatch
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-10 h-10 rounded-full" />;

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="group z-50 cursor-pointer p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative w-10 h-10 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 dark:focus-visible:ring-neutral-700"
            aria-label="Toggle Dark Mode"
        >
            <Sun className="w-5 h-5 absolute transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="w-5 h-5 absolute transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-neutral-100" />
        </button>
    );
}
