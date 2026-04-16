"use client";

import React, { useEffect, useState } from "react";
import {
  BookIcon,
  ChevronDownIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
} from "lucide-react";
import Image from "next/image";
import MobileMenu from "@/components/code/MobileMenu";
import { ThemeToggle } from "@/components/code/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Markets", href: "#markets" },
  { label: "How it Works", href: "#how-it-works" },
];

const Navbar = () => {
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  //   const { handleLogout, logoutLoading } = useSignOut();
  //   const userProfile = useAppSelector((state) => state.global.user);

  //   const { data: userData } = useGetUserProfileQuery(undefined, {
  //     skip: !!userProfile,
  //   });

  //   // @ts-ignore
  //   const user = userProfile || userData?.user;

  const getInitials = (firstName?: string, lastName?: string): string => {
    return `${firstName?.charAt(0) ?? ""}${
      lastName?.charAt(0) ?? ""
    }`.toUpperCase();
  };

  // ✅ Smooth scroll function
  const handleScroll = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenu(false); // close mobile menu
    }
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenu ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenu]);

  //   const dashboardRoute = user?.role === "admin" ? "/admin" : "/user/dashboard";

  return (
    <header className="sticky top-0 z-50 text-black backdrop-blur-3xl shadow-xl">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <div
          onClick={() => handleScroll("#home")}
          className="flex items-center gap-2 font-bold cursor-pointer"
        >
          <Image src="/6.png" alt="Logo" width={36} height={36} priority />
          <span className="text-lg font-semibold tracking-wide">Nexora</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 items-center text-sm">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleScroll(link.href)}
              className=" transition cursor-pointer hover:text-slate-700"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          <>
            <button className="px-6 py-2 bg-[#0089FF] text-white rounded-xl">
              <Link href="/login">Login</Link>
            </button>

            <button className="px-6 py-2 bg-white rounded-xl text-[#004B8C]">
              <Link href="/register">Register</Link>
            </button>
          </>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={() => setIsMobileMenu(true)}>
            <Menu className="h-6 w-6 cursor-pointer" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenu}
        onClose={() => setIsMobileMenu(false)}
        onNavigate={handleScroll}
      />
    </header>
  );
};

export default Navbar;
