"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Bell, LogOut, Menu, PanelLeft, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth, useSidebar } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationsCleared, notificationsMarkedAllAsRead } from "@/store/slices/notification-slice";
import {
  selectNotifications,
  selectUnreadNotificationsCount,
} from "@/store/selectors";
import { ROUTES } from "@/constants";
import { formatRelative, getInitials } from "@/utils";
import type { BreadcrumbItem } from "@/types";
import { cn } from "@/utils/cn";

export interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[];
  onOpenMobileNav?: () => void;
  className?: string;
}

function NotificationsMenu() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) dispatch(notificationsMarkedAllAsRead()); }}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {notifications.length > 0 ? (
            <button
              type="button"
              className="text-xs font-semibold text-accent hover:underline"
              onClick={() => dispatch(notificationsCleared())}
            >
              Clear all
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </p>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex cursor-default flex-col items-start gap-0.5 py-2"
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold">
                  {notification.title}
                </span>
                <Badge
                  variant={
                    notification.variant === "error"
                      ? "destructive"
                      : notification.variant === "success"
                        ? "success"
                        : notification.variant === "warning"
                          ? "warning"
                          : "secondary"
                  }
                >
                  {notification.variant}
                </Badge>
              </span>
              {notification.message ? (
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {notification.message}
                </span>
              ) : null}
              <span className="text-[11px] text-muted-foreground/70">
                {formatRelative(notification.createdAt)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  const displayName = user?.fullName || "Guest user";
  const initials = getInitials(displayName);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open account menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback suppressHydrationWarning>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p suppressHydrationWarning className="truncate text-sm font-bold">{displayName}</p>
          <p suppressHydrationWarning className="truncate text-xs font-normal text-muted-foreground">
            {user?.email ?? "Not signed in"}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(ROUTES.SELECT_PRODUCT)}>
          <ArrowLeftRight />
          Switch workspace
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Topbar({
  breadcrumbs,
  onOpenMobileNav,
  className,
}: TopbarProps) {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md sm:px-6",
        className
      )}
    >
      {onOpenMobileNav ? (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        >
          <Menu />
        </Button>
      ) : null}

      <Button
        variant="ghost"
        size="icon"
        className="hidden rounded-full lg:inline-flex"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={toggle}
      >
        <PanelLeft />
      </Button>

      {breadcrumbs?.length ? <Breadcrumb items={breadcrumbs} /> : null}

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
