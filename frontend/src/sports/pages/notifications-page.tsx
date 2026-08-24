"use client";

import { useMemo, useState } from "react";
import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  notificationRead,
  notificationRemoved,
  notificationsCleared,
} from "@/store/slices/notification-slice";
import { selectNotifications } from "@/store/selectors";
import { NotificationCard } from "../components/notification-card";
import { ROUTES } from "@/constants";

export function NotificationsPage() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const handleMarkAllRead = () => {
    setMarkingAll(true);
    notifications
      .filter((notification) => !notification.read)
      .forEach((notification) => dispatch(notificationRead(notification.id)));
    setMarkingAll(false);
  };

  const handleClearAll = () => {
    dispatch(notificationsCleared());
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Notifications" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Notifications"
        description="Events, polls, payment requests and messages across your groups."
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
            >
              <CheckCheck />
              Mark all read
            </Button>
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 />
              Clear all
            </Button>
          </>
        }
        className="animate-fade-in-up"
      />

      <Tabs defaultValue="all" className="mt-8">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => dispatch(notificationRead(id))}
                  onRemove={(id) => dispatch(notificationRemoved(id))}
                />
              ))}
            </div>
          ) : (
            <EmptyCard
              icon={BellOff}
              title="No notifications"
              description="Group activity and requests will appear here."
            />
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          {unreadCount > 0 ? (
            <div className="space-y-3">
              {notifications
                .filter((notification) => !notification.read)
                .map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={(id) => dispatch(notificationRead(id))}
                    onRemove={(id) => dispatch(notificationRemoved(id))}
                  />
                ))}
            </div>
          ) : (
            <EmptyCard
              icon={CheckCheck}
              title="All caught up"
              description="You have no unread notifications."
            />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
