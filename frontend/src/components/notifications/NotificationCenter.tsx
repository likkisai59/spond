/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ArrowRight,
  Square,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  notificationRead,
  notificationRemoved,
  notificationsCleared,
} from "@/store/slices/notification-slice";
import toast from "react-hot-toast";

export function NotificationCenter() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.notifications);
  
  const [activeTab, setActiveTab] = React.useState<"all" | "unread" | "read">("all");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const displayedNotifications = React.useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.read);
    }
    if (activeTab === "read") {
      return notifications.filter((n) => n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleTabChange = (tab: "all" | "unread" | "read") => {
    setActiveTab(tab);
    setSelectedIds([]);
  };

  const handleMarkRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    dispatch(notificationRead(id));
    toast.success("Notification marked as read");
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) dispatch(notificationRead(n.id));
    });
    toast.success("All notifications marked as read");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(notificationRemoved(id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    toast.success("Notification deleted");
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedNotifications.map((n) => n.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => dispatch(notificationRemoved(id)));
    setSelectedIds([]);
    toast.success("Selected notifications deleted");
  };

  const handleDeleteAllRead = () => {
    const readNotifications = notifications.filter((n) => n.read);
    if (readNotifications.length === 0) return;
    readNotifications.forEach((n) => dispatch(notificationRemoved(n.id)));
    toast.success("All read notifications deleted");
  };

  const handleNotificationClick = (n: any) => {
    if (!n.read) {
      dispatch(notificationRead(n.id));
    }
  };

  const getIcon = (variant?: string) => {
    const iconClass = "h-4 w-4 shrink-0";
    if (variant === "success") {
      return (
        <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
          <CheckCircle className={iconClass} />
        </div>
      );
    }
    if (variant === "warning") {
      return (
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
          <AlertTriangle className={iconClass} />
        </div>
      );
    }
    if (variant === "error") {
      return (
        <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
          <XCircle className={iconClass} />
        </div>
      );
    }
    return (
      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
        <Info className={iconClass} />
      </div>
    );
  };

  const formatTime = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col bg-card text-foreground rounded-xl overflow-hidden border border-border/80 shadow-md p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <h2 className="font-extrabold tracking-tight text-xl">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-3 border-b border-border/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange("all")}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
              activeTab === "all"
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button
            onClick={() => handleTabChange("unread")}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
              activeTab === "unread"
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Unread
          </button>
          <button
            onClick={() => handleTabChange("read")}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
              activeTab === "read"
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Read
          </button>
        </div>

        {displayedNotifications.length > 0 && (
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={toggleSelectAll}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 cursor-pointer bg-secondary/40 px-2 py-1 rounded"
            >
              Select All
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}

            {notifications.some((n) => n.read) && (
              <button
                onClick={handleDeleteAllRead}
                className="text-xs text-muted-foreground hover:text-red-500 font-semibold flex items-center gap-1 cursor-pointer px-2 py-1 rounded"
              >
                <span>Delete Read</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="divide-y divide-border/20 overflow-y-auto scrollbar-thin min-h-[350px]">
        {displayedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-2">
            <Bell className="h-8 w-8 opacity-40 text-muted-foreground" />
            <p className="text-xs font-semibold">No notifications to display</p>
            <p className="text-[11px] opacity-75">
              We&apos;ll alert you here when booking events occur.
            </p>
          </div>
        ) : (
          displayedNotifications.map((n) => {
            const isSelected = selectedIds.includes(n.id);
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "flex items-start gap-3 p-3.5 hover:bg-secondary/40 cursor-pointer transition-colors relative group",
                  !n.read && "bg-primary/5 hover:bg-primary/8"
                )}
              >
                <button
                  onClick={(e) => toggleSelect(n.id, e)}
                  className="p-1 hover:bg-secondary rounded self-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 opacity-40" />
                  )}
                </button>

                {getIcon(n.variant)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={cn(
                        "text-xs font-extrabold truncate",
                        !n.read ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {n.title}
                    </h4>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          onClick={(e) => handleMarkRead(n.id, e)}
                          title="Mark as read"
                          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        title="Delete notification"
                        className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(n.createdAt)}</span>
                  </div>
                </div>

                {!n.read && (
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
