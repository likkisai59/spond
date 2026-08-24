"use client";

import { ADMIN_NAV, APP_NAME, ROUTES } from "@/constants";
import { useSidebar } from "@/hooks";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Sidebar, SidebarNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { LogoMark } from "@/components/shared/brand";
import { pathToBreadcrumbs } from "@/utils/helpers";
import { cn } from "@/utils/cn";

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isCollapsed, toggle, isMobileOpen, openMobile, closeMobile } =
    useSidebar();

  const breadcrumbs = pathToBreadcrumbs(ROUTES.ADMIN);
  breadcrumbs[1] = { label: "Admin Panel", href: ROUTES.ADMIN };

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 z-30">
          <Sidebar
            sections={ADMIN_NAV}
            collapsed={isCollapsed}
            onToggleCollapse={toggle}
            variant="dark"
            workspaceLabel="Admin Panel"
          />
        </div>
      </div>

      <Drawer open={isMobileOpen} onOpenChange={(open) => !open && closeMobile()}>
        <DrawerContent side="left" className="bg-primary">
          <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-4">
            <LogoMark />
            <span className="ml-2.5 truncate text-sm font-extrabold text-white">
              {APP_NAME} Admin
            </span>
          </div>
          <SidebarNav sections={ADMIN_NAV} collapsed={false} variant="dark" onNavigate={closeMobile} />
        </DrawerContent>
      </Drawer>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          isCollapsed
            ? "lg:pl-[var(--sidebar-collapsed-width)]"
            : "lg:pl-[var(--sidebar-width)]"
        )}
      >
        <Topbar breadcrumbs={breadcrumbs} onOpenMobileNav={openMobile} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
