"use client";

import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface DashboardStatItem {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  href?: string;
}

export interface DashboardStatsCardsProps {
  items: DashboardStatItem[];
  gridCols?: string;
}

export function DashboardStatsCards({
  items,
  gridCols = "grid-cols-2 lg:grid-cols-4"
}: DashboardStatsCardsProps) {
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {items.map((card, idx) => {
        const Icon = card.icon;
        const CardElement = (
          <Card
            className={`bg-card/45 backdrop-blur-md border ${card.bg} transition-all duration-300 hover:scale-[1.02] shadow-lg h-full ${
              card.href ? "cursor-pointer hover:border-primary/30" : ""
            }`}
          >
            <CardContent className="p-4 flex items-center justify-between h-full">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">
                  {card.title}
                </span>
                <span className="text-xl font-extrabold text-foreground block">
                  {card.value}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {card.description}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl bg-accent border border-border ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );

        if (card.href) {
          return (
            <Link key={idx} href={card.href} className="block h-full">
              {CardElement}
            </Link>
          );
        }

        return <React.Fragment key={idx}>{CardElement}</React.Fragment>;
      })}
    </div>
  );
}
