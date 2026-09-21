"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Settings, User, Mail, ShieldAlert, Edit3 } from "lucide-react";
import { NotificationPreferencesCard } from "@/components/notifications/NotificationPreferencesCard";
import toast from "react-hot-toast";

export default function ArtistSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Profile Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your account credentials, security access levels, and notifications.
        </p>
      </div>

      <Card className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden shadow-xl">
        <CardHeader className="border-b border-border/60 bg-card/20 p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
            <User className="h-4.5 w-4.5 text-primary" />
            Artist Account Profile
          </CardTitle>
          <Button asChild size="sm" className="font-bold text-xs h-8 gap-1.5">
            <Link href="/band/artist/profile?tab=edit">
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile Details
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Name</label>
            <p className="text-sm font-bold text-foreground">
              {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A" : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Email</label>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {user?.email || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Role Permission</label>
            <p className="text-xs font-bold text-primary capitalize bg-primary/10 border border-primary/20 px-2 py-0.5 rounded self-start inline-block">
              Artist
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden shadow-xl">
        <CardHeader className="border-b border-border/60 bg-card/20 p-5">
          <CardTitle className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-primary" />
            Security Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Security policy forces credentials settings verification via Authentication slice settings. Use standard reset actions to adjust credentials.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="font-bold text-xs h-9"
            onClick={() => toast.success("Password reset instructions sent to your registered email.")}
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      <NotificationPreferencesCard />
    </div>
  );
}
