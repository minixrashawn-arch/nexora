"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="relative inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/10 cursor-pointer bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
          {/* Sun */}
          <Sun className="h-5 w-5 text-black scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />

          {/* Moon */}
          <Moon className="absolute h-5 w-5 text-white scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />

          <span className="sr-only">Toggle theme</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
