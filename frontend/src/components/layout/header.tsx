"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Logo } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PUBLIC_NAV, ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href={ROUTES.LOGIN}>Log in</Link>
          </Button>
          <Button asChild variant="accent" className="hidden sm:inline-flex">
            <Link href={ROUTES.REGISTER}>Get started</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </div>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerContent side="right" className="p-6">
          <DrawerHeader>
            <DrawerTitle>
              <Logo />
            </DrawerTitle>
          </DrawerHeader>
          <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile">
            {PUBLIC_NAV.map((item) => (
              <DrawerClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </DrawerClose>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <DrawerClose asChild>
                <Button asChild variant="outline">
                  <Link href={ROUTES.LOGIN}>Log in</Link>
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button asChild variant="accent">
                  <Link href={ROUTES.REGISTER}>Get started</Link>
                </Button>
              </DrawerClose>
            </div>
          </nav>
        </DrawerContent>
      </Drawer>
    </header>
  );
}
