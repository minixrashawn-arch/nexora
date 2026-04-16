import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className=" w-full border-b border-orange-200/50backdrop-blur-md">
      <div className="flex items-center justify-between px-4 md:px-6">
        {/* Left: Sidebar trigger + Title */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="h-9 w-9 shrink-0 rounded-lg hover:bg-orange-100" />

          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-500 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Theme toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
