"use client";

import * as React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface DashboardActionItem {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export interface DashboardQuickActionsProps {
  title?: string;
  actions: DashboardActionItem[];
}

export function DashboardQuickActions({
  title = "Quick Actions",
  actions
}: DashboardQuickActionsProps) {
  return (
    <Card className="bg-card/45 backdrop-blur-md border border-border shadow-xl">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              href={act.href}
              className={`flex items-start gap-3 p-3.5 rounded-xl border border-border bg-accent/20 transition-all duration-300 hover:scale-[1.01] hover:border-primary/20 group ${act.color}`}
            >
              <div className="p-2 rounded-lg bg-accent border border-border">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                  {act.label}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {act.description}
                </span>
              </div>
              <ArrowRight className="h-3 w-3 self-center text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
