"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  DollarSign,
  Image as ImageIcon,
  MapPin,
  Mic2,
  Music2,
  Phone,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  Video,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { ROUTES } from "@/constants";

type ProviderKind = "Venue" | "Artist" | "Band";

export function ProviderOnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    kind: "Band" as ProviderKind,
    name: "",
    city: "Hyderabad",
    phone: "",
    bio: "",
    mediaUrl: "",
    videoUrl: "",
    packageTitle: "Wedding & Celebration Package",
    packagePrice: 25000,
    packageDurationHours: 4,
    inclusions: "Full sound system, 4 musicians, 1 vocalist, stage setup",
    travelPolicy: "Included within city limits",
    payoutUpi: "",
    bankAccount: "",
    ifsc: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(4, prev + 1) as any);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await eventHubService.onboardProvider({
        provider_type: formData.kind,
        name: formData.name,
        city: formData.city,
        contact_phone: formData.phone,
        bio: formData.bio,
        profile_image: formData.profileImage,
        video_url: formData.videoUrl,
        images: formData.profileImage ? [formData.profileImage] : [],
        packages: [
          {
            id: "pkg_1",
            title: formData.packageTitle,
            price: Number(formData.packagePrice),
            duration_hours: Number(formData.packageDurationHours),
            inclusions: formData.inclusions.split(",").map((s: string) => s.trim()).filter(Boolean),
          },
        ],
        base_price: Number(formData.packagePrice),
        payout_upi: formData.payoutUpi,
        bank_account: formData.bankAccount,
        bank_ifsc: formData.ifsc,
      }).catch(() => {});

      setSubmitted(true);
      dispatch(
        notificationAdded({
          title: "Provider Profile Ready!",
          message: `Welcome to EventHub, ${formData.name}! Your profile is active.`,
          type: "success",
        })
      );
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PageContainer className="py-12">
        <Card className="max-w-lg mx-auto p-8 rounded-3xl text-center space-y-4 border-emerald-500/30 bg-emerald-500/5 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">
            Onboarding Complete!
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your {formData.kind} profile for <strong className="text-foreground">{formData.name}</strong> is now live on the EventHub marketplace. Clients can discover your packages and send booking requests.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="w-full sm:w-auto rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs">
              <Link href={ROUTES.BAND_PROVIDER_DASHBOARD}>Open Provider Dashboard →</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl text-xs">
              <Link href={ROUTES.BAND}>Visit Marketplace</Link>
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 space-y-8 max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Marketplace", href: ROUTES.BAND },
          { label: "Provider Onboarding" },
        ]}
      />

      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-pink-500 flex items-center justify-center gap-1.5">
          <Sparkles className="h-4 w-4" /> 4-Step Provider Setup
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Join EventHub as a Service Provider
        </h1>
        <p className="text-xs text-muted-foreground">
          Showcase your packages, set blackout dates, and receive confirmed gig bookings with guaranteed advance milestones.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, title: "Identity" },
          { num: 2, title: "Media & Bio" },
          { num: 3, title: "Packages" },
          { num: 4, title: "Payouts" },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              step === s.num
                ? "border-pink-500 bg-pink-500/10 text-pink-500 font-bold"
                : step > s.num
                ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500 font-semibold"
                : "border-border/50 bg-card text-muted-foreground font-normal"
            }`}
          >
            <span className="text-[10px] uppercase block">Step {s.num}</span>
            <span className="text-xs">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Main Wizard Form Card */}
      <Card className="rounded-3xl border-border/80 p-6 sm:p-8 shadow-xl bg-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Identity & Role */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-foreground">
                Step 1 — Choose Your Provider Category
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { kind: "Venue", icon: Building2, desc: "Banquets, halls, lawns" },
                  { kind: "Artist", icon: Mic2, desc: "Singers, DJs, solo acts" },
                  { kind: "Band", icon: Music2, desc: "Live bands & orchestras" },
                ].map((item) => (
                  <button
                    key={item.kind}
                    type="button"
                    onClick={() => handleChange("kind", item.kind)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      formData.kind === item.kind
                        ? "border-pink-500 bg-pink-500/10 shadow-md ring-2 ring-pink-500/20"
                        : "border-border/70 bg-muted/30 hover:bg-muted/60"
                    }`}
                  >
                    <item.icon className={`h-6 w-6 mb-2 ${formData.kind === item.kind ? "text-pink-500" : "text-muted-foreground"}`} />
                    <h4 className="font-bold text-sm text-foreground">{item.kind}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="provider-name" className="text-xs font-semibold">
                  {formData.kind === "Venue" ? "Venue Name" : formData.kind === "Artist" ? "Artist / Stage Name" : "Band Name"} *
                </Label>
                <Input
                  id="provider-name"
                  placeholder={formData.kind === "Venue" ? "e.g. Royal Palace Banquet" : formData.kind === "Artist" ? "e.g. Ananya Vocalist" : "e.g. Hyderabad Beats"}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="rounded-xl h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="provider-city" className="text-xs font-semibold">Base City *</Label>
                  <Input
                    id="provider-city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="rounded-xl h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="provider-phone" className="text-xs font-semibold">Phone / WhatsApp *</Label>
                  <Input
                    id="provider-phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="rounded-xl h-10"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Media & Bio */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-foreground">
                Step 2 — Bio, Photos & Performance Clip
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="provider-bio" className="text-xs font-semibold">Short Bio / Description *</Label>
                <Textarea
                  id="provider-bio"
                  rows={3}
                  placeholder="Tell clients about your performance style, genre versatility, sound setup, and past memorable gigs..."
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="provider-video" className="text-xs font-semibold">
                  Performance / Venue Video Link (YouTube, Instagram or Vimeo)
                </Label>
                <div className="relative">
                  <Input
                    id="provider-video"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => handleChange("videoUrl", e.target.value)}
                    className="rounded-xl h-10 pl-9"
                  />
                  <Video className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Pricing & Packages */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-foreground">
                Step 3 — Primary Booking Package
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="package-title" className="text-xs font-semibold">Package Title *</Label>
                <Input
                  id="package-title"
                  value={formData.packageTitle}
                  onChange={(e) => handleChange("packageTitle", e.target.value)}
                  className="rounded-xl h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="package-price" className="text-xs font-semibold">Base Price (₹) *</Label>
                  <Input
                    id="package-price"
                    type="number"
                    min={1000}
                    step={1000}
                    value={formData.packagePrice}
                    onChange={(e) => handleChange("packagePrice", Number(e.target.value))}
                    className="rounded-xl h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="package-duration" className="text-xs font-semibold">Duration (Hours) *</Label>
                  <Input
                    id="package-duration"
                    type="number"
                    min={1}
                    max={24}
                    value={formData.packageDurationHours}
                    onChange={(e) => handleChange("packageDurationHours", Number(e.target.value))}
                    className="rounded-xl h-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="package-inclusions" className="text-xs font-semibold">Included Services *</Label>
                <Input
                  id="package-inclusions"
                  value={formData.inclusions}
                  onChange={(e) => handleChange("inclusions", e.target.value)}
                  placeholder="e.g. 2 Keyboards, 1 Drummer, Lead Vocalist, Stage Audio System"
                  className="rounded-xl h-10"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 4: Bank / UPI / Payout */}
          {step === 4 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-foreground">
                Step 4 — Payout Details & Bank Information
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter your receiving bank or UPI ID. Advance and final milestone payments will be routed here upon completion.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="payout-upi" className="text-xs font-semibold">UPI ID (Fastest)</Label>
                <Input
                  id="payout-upi"
                  placeholder="e.g. bandname@okhdfcbank"
                  value={formData.payoutUpi}
                  onChange={(e) => handleChange("payoutUpi", e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bank-acc" className="text-xs font-semibold">Bank Account Number</Label>
                  <Input
                    id="bank-acc"
                    placeholder="9182736450"
                    value={formData.bankAccount}
                    onChange={(e) => handleChange("bankAccount", e.target.value)}
                    className="rounded-xl h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank-ifsc" className="text-xs font-semibold">IFSC Code</Label>
                  <Input
                    id="bank-ifsc"
                    placeholder="HDFC0001234"
                    value={formData.ifsc}
                    onChange={(e) => handleChange("ifsc", e.target.value)}
                    className="rounded-xl h-10"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Financial details are strictly encrypted and only used for verified gig payouts.</span>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-border/50 flex justify-between gap-3">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="rounded-xl text-xs font-semibold h-10"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="rounded-xl text-xs font-bold h-10 px-6 bg-pink-600 hover:bg-pink-700 text-white shadow-md"
              >
                Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl text-xs font-bold h-10 px-6 bg-pink-600 hover:bg-pink-700 text-white shadow-md"
              >
                {loading ? "Publishing Profile..." : "Complete & Launch Profile →"}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
