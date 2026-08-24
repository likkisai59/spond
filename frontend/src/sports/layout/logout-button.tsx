"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useSidebar } from "@/hooks";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

export function SportsLogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const { isCollapsed } = useSidebar();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className={cn(
        "w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
        isCollapsed ? "justify-center" : "justify-start"
      )}
      aria-label="Log out of Sports"
    >
      <LogOut className="h-5 w-5 shrink-0" />
      {!isCollapsed ? <span>Logout</span> : null}
    </Button>
  );
}
