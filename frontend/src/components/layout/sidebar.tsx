"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo, LogoMark } from "@/components/shared/brand";
import { useAuth } from "@/hooks";
import { getInitials } from "@/utils/helpers";
import type { NavSection } from "@/types";
import { cn } from "@/utils/cn";

export interface SidebarProps {
  sections: NavSection[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  variant?: "default" | "dark";
  workspaceLabel?: string;
  footer?: React.ReactNode;
  className?: string;
}

export function SidebarNav({
  sections,
  collapsed,
  variant = "default",
  onNavigate,
}: Pick<SidebarProps, "sections" | "collapsed" | "variant"> & {
    onNavigate?: () => void;
  }) {
  const pathname = usePathname();
  const dark = variant === "dark";

  return (
    <nav aria-label="Sidebar" className="flex flex-col gap-6 px-3 py-4">
      {sections.map((section, sectionIndex) => (
        <div key={section.title ?? `section-${sectionIndex}`} className="space-y-1">
          {section.title && !collapsed ? (
            <p
              className={cn(
                "px-3 pb-1 text-xs font-bold uppercase tracking-wider",
                dark ? "text-white/50" : "text-muted-foreground"
              )}
            >
              {section.title}
            </p>
          ) : null}
          {section.items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            const itemClasses = cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              collapsed && "justify-center px-0",
              dark
                ? isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                : isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              item.disabled && "pointer-events-none opacity-40"
            );

            const inner = (
              <>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
                {!collapsed && item.badge ? (
                  <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </>
            );

            const link = item.disabled ? (
              <span aria-disabled className={itemClasses}>
                {inner}
              </span>
            ) : (
              <Link
                href={item.href}
                className={itemClasses}
                aria-current={isActive ? "page" : undefined}
                onClick={onNavigate}
                prefetch={item.href.startsWith('/sports') ? true : undefined}
              >
                {inner}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.href}>{link}</div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({
  sections,
  collapsed,
  onToggleCollapse,
  variant = "default",
  workspaceLabel,
  footer,
  className,
}: SidebarProps) {
  const dark = variant === "dark";

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card transition-[width] duration-200",
        dark ? "border-white/10 bg-primary" : "border-border/70",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 border-b px-4",
          dark ? "border-white/10" : "border-border/70",
          collapsed
            ? "flex-col items-center gap-1.5 px-0 py-3"
            : "h-16 items-center justify-between"
        )}
      >
        {collapsed ? (
          <LogoMark />
        ) : (
          <div className="flex min-w-0 flex-col">
            <Logo inverted={dark} />
            {workspaceLabel ? (
              <span
                className={cn(
                  "truncate text-xs font-semibold",
                  dark ? "text-white/60" : "text-muted-foreground"
                )}
              >
                {workspaceLabel}
              </span>
            ) : null}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn(
            "rounded-full",
            dark && "text-white/70 hover:bg-white/10 hover:text-white"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed ? <span>Collapse</span> : null}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <SidebarNav sections={sections} collapsed={collapsed} variant={variant} />
      </ScrollArea>

      <SidebarProfile collapsed={collapsed} dark={dark} />

      {footer ? (
        <div
          className={cn(
            "shrink-0 border-t px-3 py-3",
            dark ? "border-white/10" : "border-border/70"
          )}
        >
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

function SidebarProfile({
  collapsed,
  dark,
}: {
  collapsed: boolean;
  dark: boolean;
}) {
  const { user } = useAuth();
  const name = user
    ? `${user.firstName} ${user.lastName}`.trim() || "Guest user"
    : "Guest user";
  const role = user ? user.role : null;

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2",
        collapsed && "justify-center px-0"
      )}
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      {!collapsed ? (
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-bold",
              dark && "text-white"
            )}
          >
            {name}
          </p>
          <p
            className={cn(
              "truncate text-xs font-semibold capitalize",
              dark ? "text-white/60" : "text-muted-foreground"
            )}
          >
            {role ?? "Not signed in"}
          </p>
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "shrink-0 border-t px-3 py-3",
        dark ? "border-white/10" : "border-border/70"
      )}
    >
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{content}</div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-bold">{name}</p>
            {role ? (
              <p className="text-xs capitalize text-muted-foreground">{role}</p>
            ) : null}
          </TooltipContent>
        </Tooltip>
      ) : (
        content
      )}
    </div>
  );
}
