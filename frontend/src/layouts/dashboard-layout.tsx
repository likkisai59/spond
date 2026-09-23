"use client";

import * as React from "react";
import { BAND_CLIENT_NAV, BAND_ARTIST_NAV, BAND_VENUE_NAV, PRODUCT_CONFIGS, SPORTS_NAV, OWNER_NAV } from "@/constants";
import { useSidebar } from "@/hooks";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Sidebar, SidebarNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { LogoMark } from "@/components/shared/brand";
import { pathToBreadcrumbs } from "@/utils/helpers";
import type { ProductKey } from "@/types";
import { cn } from "@/utils/cn";

export interface DashboardLayoutProps {
  product: ProductKey;
  sidebarFooter?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({
  product,
  sidebarFooter,
  children,
}: DashboardLayoutProps) {
  const [mounted, setMounted] = React.useState(false);
  const { isCollapsed, toggle, isMobileOpen, openMobile, closeMobile } =
    useSidebar();

  const user = useAppSelector((state) => state.auth.user);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveRole = user?.role || (pathname?.includes("/band/artist") || pathname?.includes("/band/bands") ? "artist" : pathname?.includes("/band/venue") ? "venue_owner" : "client");

  const sections =
    !mounted
      ? []
      : product === "sports"
      ? (user?.role === "venue_owner" || user?.role === "sports_venue_owner")
        ? OWNER_NAV
        : SPORTS_NAV
      : effectiveRole === "artist" || effectiveRole === "band"
        ? BAND_ARTIST_NAV
        : effectiveRole === "venue_owner"
          ? BAND_VENUE_NAV
          : BAND_CLIENT_NAV;
  const config = PRODUCT_CONFIGS[product];

  const breadcrumbs = pathToBreadcrumbs(`/${product}`);
  breadcrumbs[1] = { label: config.name, href: config.href };

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      {mounted && (
        <>
          <div className="hidden lg:block">
            <div className="fixed inset-y-0 left-0 z-30">
              <Sidebar
                sections={sections}
                collapsed={isCollapsed}
                onToggleCollapse={toggle}
                workspaceLabel={config.name}
                footer={sidebarFooter}
              />
            </div>
          </div>

          <Drawer open={isMobileOpen} onOpenChange={(open) => !open && closeMobile()}>
            <DrawerContent side="left">
              <div className="flex h-full flex-col">
                <div className="flex h-16 shrink-0 items-center border-b border-border/70 px-4">
                  <LogoMark />
                  <span className="ml-2.5 truncate text-sm font-extrabold text-primary">
                    {config.name}
                  </span>
                </div>
                <SidebarNav sections={sections} collapsed={false} onNavigate={closeMobile} />
                {sidebarFooter ? (
                  <div className="mt-auto border-t border-border/70 px-3 py-3">
                    {sidebarFooter}
                  </div>
                ) : null}
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          mounted && isCollapsed
            ? "lg:pl-[var(--sidebar-collapsed-width)]"
            : mounted
              ? "lg:pl-[var(--sidebar-width)]"
              : ""
        )}
        suppressHydrationWarning
      >
        {mounted && <Topbar breadcrumbs={breadcrumbs} onOpenMobileNav={openMobile} />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
