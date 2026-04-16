"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  BarChart2Icon,
  Settings2Icon,
  UsersIcon,
  TrendingUpIcon,
  WalletIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { useAppDispatch } from "@/state/redux";
import { useLogoutMutation } from "@/state/api/authApi";
import { clearCredentials } from "@/state/slice/authSlice";

const userLinks = [
  {
    title: "Dashboard",
    url: "/user/dashboard/home",
    icon: LayoutDashboardIcon,
  },
  { title: "Market", url: "/user/dashboard/market", icon: BarChart2Icon },

  {
    title: "Transactions",
    url: "/user/dashboard/transactions",
    icon: ClockIcon,
  },
  { title: "Settings", url: "/user/dashboard/settings", icon: Settings2Icon },
];

const adminLinks = [
  {
    title: "Overview",
    url: "/admin/dashboard/home",
    icon: LayoutDashboardIcon,
  },
  { title: "Users", url: "/admin/dashboard/users", icon: UsersIcon },
  {
    title: "Deposits",
    url: "/admin/dashboard/deposits",
    icon: ArrowDownCircleIcon,
  },
  {
    title: "Withdrawals",
    url: "/admin/dashboard/withdrawals",
    icon: ArrowUpCircleIcon,
  },
  {
    title: "Price Control",
    url: "/admin/dashboard/price",
    icon: TrendingUpIcon,
  },
  { title: "Wallets", url: "/admin/dashboard/wallets", icon: WalletIcon },
  { title: "Settings", url: "/admin/dashboard/settings", icon: Settings2Icon },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

  const isAdmin = pathname.startsWith("/admin");
  const links = isAdmin ? adminLinks : userLinks;
  const label = isAdmin ? "Management" : "Menu";

  const handleNavClick = () => {
    setOpenMobile(false);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // still clear local state even if API fails
    } finally {
      dispatch(clearCredentials()); // clears localStorage too
      router.replace("/login");
    }
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* ── Header ───────────────────────────────────────── */}
      <SidebarHeader className="border-b px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-transparent"
              render={
                <a
                  href={
                    isAdmin ? "/admin/dashboard/home" : "/user/dashboard/home"
                  }
                />
              }
            >
              <Image
                src="/6.png"
                alt="Nexora"
                width={32}
                height={32}
                className="rounded-md"
              />
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight">
                  Nexora
                </span>
                {isAdmin && (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Admin Panel
                  </span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Nav Links ─────────────────────────────────────── */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground mb-1">
            {label}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.url;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    onClick={handleNavClick}
                    render={<a href={item.url} />}
                    className={
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : ""
                    }
                  >
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ───────────────────────────────────────── */}
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <a
                  href={
                    isAdmin
                      ? "/admin/dashboard/settings"
                      : "/user/dashboard/settings"
                  }
                />
              }
            >
              <UserIcon className="size-4" />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOutIcon className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
