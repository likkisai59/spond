"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, ShieldCheck, Sparkles, Edit3, Save, X, Phone, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ClientProfilePage() {
  const { user, setUser } = useAuth() as any;

  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    full_name: "",
    phone: "",
  });

  // Sync form with user data when loaded
  React.useEffect(() => {
    if (user) {
      setForm({
        full_name: user.name || user.full_name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch<any>("/auth/me", form);
      const updated = data.data;
      // Refresh auth user in store if setUser is available
      if (setUser && typeof setUser === "function") {
        setUser(updated);
      }
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: user?.name || user?.full_name || "",
      phone: user?.phone || "",
    });
    setEditing(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            My Profile
          </h1>
          <p className="text-xs text-muted-foreground">
            View and update your client account details.
          </p>
        </div>
        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            size="sm"
            className="font-bold text-xs h-9 gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        )}
      </div>

      <Card className="bg-card/60 border border-border rounded-2xl shadow-md overflow-hidden">
        <CardHeader className="border-b border-border p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Account Info
          </CardTitle>
          {editing && (
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold animate-pulse">
              Editing
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {editing ? (
            /* ── Edit Mode ── */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full-name" className="text-xs font-bold uppercase text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="full-name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Enter your name"
                  className="text-sm bg-card/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email-display" className="text-xs font-bold uppercase text-muted-foreground">
                  Email (cannot be changed)
                </Label>
                <Input
                  id="email-display"
                  value={user?.email || ""}
                  disabled
                  className="text-sm bg-muted/30 opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  type="tel"
                  className="text-sm bg-card/60"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="sm"
                  className="font-bold text-xs h-9 gap-1.5"
                >
                  {saving ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  size="sm"
                  className="font-bold text-xs h-9 gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* ── View Mode ── */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Name</p>
                      <p className="text-sm font-semibold text-foreground">
                        {user?.name || user?.full_name || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Email</p>
                      <p className="text-sm font-semibold text-foreground">{user?.email || "Not available"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Phone</p>
                      <p className="text-sm font-semibold text-foreground">
                        {user?.phone || <span className="text-muted-foreground italic">Not provided</span>}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge className="w-fit bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    {typeof user?.role === "string" ? user.role : "client"}
                  </Badge>
                  {user?.is_verified && (
                    <Badge className="w-fit bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
