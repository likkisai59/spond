"use client";

import * as React from "react";
import { useForm, Controller, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { artistProfileUpdateSchema, ArtistProfileUpdateFormData } from "@/utils/validation";
import { ArtistProfile } from "@/types/artist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { PhoneInputField } from "@/components/shared/PhoneInputField";
import { Plus, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";

interface ArtistProfileEditProps {
  profile: ArtistProfile;
  onSuccess: (updated: ArtistProfileUpdateFormData) => void;
}

const LANGUAGES = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "English"];
const GENRES = ["Melody", "Rock", "Pop", "Classical", "Folk", "Fusion", "DJ", "Others"];

export function ArtistProfileEdit({ profile, onSuccess }: ArtistProfileEditProps) {
  const [newAchievement, setNewAchievement] = React.useState("");

  const getFormValuesFromProfile = React.useCallback(
    (p: ArtistProfile): ArtistProfileUpdateFormData => ({
      name: (p as any)?.name || "",
      display_name: p.display_name || "",
      bio: p.bio || "",
      years_of_experience: p.years_of_experience ?? 0,
      profile_image: p.profile_image || "",
      cover_image: p.cover_image || "",
      mobile_number: p.mobile_number || "",
      band_type: (p.band_type as any) || "Solo",
      total_members: p.total_members ?? 1,
      base_rate: p.base_rate ?? 0,
      currency: p.currency || "INR",
      travel_radius: p.travel_radius ?? 0,
      travel_charges: p.travel_charges ?? 0,
      min_booking_hours: p.min_booking_hours ?? 0,
      max_booking_hours: p.max_booking_hours ?? 0,
      equipment: {
        own_speaker: !!p.equipment?.own_speaker,
        mic: !!p.equipment?.mic,
        mixer: !!p.equipment?.mixer,
        keyboard: !!p.equipment?.keyboard,
        guitar: !!p.equipment?.guitar,
        drums: !!p.equipment?.drums,
        lighting: !!p.equipment?.lighting,
        dj_console: !!p.equipment?.dj_console,
      },
      languages: p.languages?.map((l: any) => (typeof l === "string" ? l : l?.name)).filter(Boolean) || [],
      genres: p.genres?.map((g: any) => (typeof g === "string" ? g : g?.name)).filter(Boolean) || [],
      social_links: {
        instagram: p.social_links?.instagram || "",
        facebook: p.social_links?.facebook || "",
        twitter: p.social_links?.twitter || "",
        website: p.social_links?.website || "",
      },
      achievements: p.achievements || [],
    }),
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm<ArtistProfileUpdateFormData>({
    resolver: zodResolver(artistProfileUpdateSchema),
    defaultValues: getFormValuesFromProfile(profile)
  });

  React.useEffect(() => {
    if (profile) {
      reset(getFormValuesFromProfile(profile));
    }
  }, [profile, reset, getFormValuesFromProfile]);

  const watchedLanguages = watch("languages") || [];
  const watchedGenres = watch("genres") || [];
  const watchedEquipment = watch("equipment") || {};
  const watchedAchievements = watch("achievements") || [];
  const watchedProfileImg = watch("profile_image");
  const watchedCoverImg = watch("cover_image");
  const watchedBandType = watch("band_type") || "Solo";

  // Bug 7: Auto-sync total_members based on performer type
  React.useEffect(() => {
    if (watchedBandType === "Solo") setValue("total_members", 1);
    else if (watchedBandType === "Duo") setValue("total_members", 2);
    else if (watchedBandType === "Trio") setValue("total_members", 3);
    // Band → leave editable
  }, [watchedBandType, setValue]);

  const toggleLanguage = (lang: string) => {
    const current = [...watchedLanguages];
    const idx = current.indexOf(lang);
    if (idx > -1) current.splice(idx, 1);
    else current.push(lang);
    setValue("languages", current);
  };

  const toggleGenre = (genre: string) => {
    const current = [...watchedGenres];
    const idx = current.indexOf(genre);
    if (idx > -1) current.splice(idx, 1);
    else current.push(genre);
    setValue("genres", current);
  };

  const toggleEquipment = (key: string) => {
    setValue(`equipment.${key}` as Path<ArtistProfileUpdateFormData>, !watchedEquipment[key as keyof typeof watchedEquipment]);
  };

  const addAchievement = () => {
    if (!newAchievement.trim()) return;
    setValue("achievements", [...watchedAchievements, newAchievement.trim()]);
    setNewAchievement("");
  };

  const removeAchievement = (idx: number) => {
    const current = [...watchedAchievements];
    current.splice(idx, 1);
    setValue("achievements", current);
  };

  const onFormSubmit = (data: ArtistProfileUpdateFormData) => {
    const trimmed = newAchievement.trim();
    if (trimmed && !data.achievements?.includes(trimmed)) {
      data.achievements = [...(data.achievements || []), trimmed];
      setNewAchievement("");
    }
    onSuccess(data);
  };

  const onFormError = (formErrors: any) => {
    console.error("[ArtistProfileEdit] Form validation error:", formErrors);
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      const firstError = formErrors[errorKeys[0]];
      const message = firstError?.message || `Please check the ${errorKeys[0]} field.`;
      toast.error(message);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit, onFormError)}
      className="space-y-8 bg-card/45 backdrop-blur-md border border-border p-6 md:p-8 rounded-3xl shadow-xl"
    >
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold text-foreground">Edit Band Profile Details</h2>
        <p className="text-xs text-muted-foreground">Update how your band looks on the public search listings.</p>
      </div>

      {/* Grid: basic text fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Band / Performer Legal Name</Label>
            <Input
              id="name"
              placeholder="e.g. Rockstar Band"
              {...register("name")}
            />
            <p className="text-[10px] text-muted-foreground">Letters and spaces only — no numbers</p>
            {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="display_name">Display Name (Unique handle)</Label>
            <Input
              id="display_name"
              placeholder="e.g. rockstar-band or rockstar_band"
              {...register("display_name")}
            />
            <p className="text-[10px] text-muted-foreground">Letters, hyphens & underscores only — no numbers or spaces</p>
            {errors.display_name && <p className="text-xs text-error">{errors.display_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mobile_number">Mobile / Booking Phone</Label>
            <Controller
              name="mobile_number"
              control={control}
              render={({ field }) => (
                <PhoneInputField
                  id="mobile_number"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.mobile_number?.message}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="years_of_experience">Years of Active Experience</Label>
            <Input id="years_of_experience" type="number" {...register("years_of_experience", { valueAsNumber: true })} />
            {errors.years_of_experience && <p className="text-xs text-error">{errors.years_of_experience.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Avatar Photo</Label>
            <ImageUpload 
              value={watchedProfileImg} 
              onChange={(url) => setValue("profile_image", url)}
              onRemove={() => setValue("profile_image", "")}
              subfolder="artists/avatars"
            />
            {errors.profile_image && <p className="text-xs text-error">{errors.profile_image.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Cover Banner</Label>
            <ImageUpload 
              value={watchedCoverImg} 
              onChange={(url) => setValue("cover_image", url)}
              onRemove={() => setValue("cover_image", "")}
              subfolder="artists/covers"
            />
            {errors.cover_image && <p className="text-xs text-error">{errors.cover_image.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">About Performer / Band Biography</Label>
        <Textarea id="bio" rows={4} placeholder="Describe your genres, influences, history..." {...register("bio")} />
        {errors.bio && <p className="text-xs text-error">{errors.bio.message}</p>}
      </div>

      {/* Languages & Genres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Languages Performed</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => {
              const active = watchedLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`h-9 px-4 rounded-full text-xs font-semibold border transition-all ${
                    active ? "bg-primary border-primary text-primary-foreground" : "bg-accent/40 border-border text-muted-foreground"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
          {errors.languages && <p className="text-xs text-error mt-1">{errors.languages.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Music Genres</Label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(genre => {
              const active = watchedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`h-9 px-4 rounded-full text-xs font-semibold border transition-all ${
                    active ? "bg-primary border-primary text-primary-foreground" : "bg-accent/40 border-border text-muted-foreground"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
          {errors.genres && <p className="text-xs text-error mt-1">{errors.genres.message}</p>}
        </div>
      </div>

      {/* Performer Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Performer Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="band_type">Performer Type</Label>
            <select
              id="band_type"
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-xs"
              {...register("band_type")}
            >
              <option value="Solo">Solo (1 member)</option>
              <option value="Duo">Duo (2 members)</option>
              <option value="Trio">Trio (3 members)</option>
              <option value="Band">Band (4+ members)</option>
            </select>
            {errors.band_type && <p className="text-xs text-error mt-1">{errors.band_type.message}</p>}
          </div>

          {/* Total Members: hidden for Solo, locked for Duo/Trio, editable for Band */}
          {watchedBandType !== "Solo" && (
            <div className="space-y-1.5">
              <Label htmlFor="total_members">Total Members</Label>
              <div className="relative">
                <Input
                  id="total_members"
                  type="number"
                  min={watchedBandType === "Duo" ? 2 : watchedBandType === "Trio" ? 3 : 4}
                  readOnly={watchedBandType === "Duo" || watchedBandType === "Trio"}
                  {...register("total_members", { valueAsNumber: true })}
                  className={watchedBandType !== "Band" ? "bg-muted/40 cursor-not-allowed" : ""}
                />
                {(watchedBandType === "Duo" || watchedBandType === "Trio") && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground">
                    Auto-set
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {watchedBandType === "Duo" ? "Locked at 2 for Duo" :
                 watchedBandType === "Trio" ? "Locked at 3 for Trio" :
                 "Enter total band member count (min 4)"}
              </p>
              {errors.total_members && <p className="text-xs text-error mt-1">{errors.total_members.message}</p>}
            </div>
          )}
          {watchedBandType === "Solo" && (
            <div className="space-y-1.5">
              <Label>Total Members</Label>
              <div className="h-10 px-3 rounded-lg border border-border bg-muted/40 flex items-center text-xs text-muted-foreground">
                1 — Solo performer
              </div>
              <p className="text-[10px] text-muted-foreground">Automatically set to 1 for Solo</p>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Checkboxes */}
      <div className="space-y-3">
        <Label>Available Show Equipment</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.keys(watchedEquipment).map(key => {
            const isSelected = !!watchedEquipment[key as keyof typeof watchedEquipment];
            const label = key.replace("_", " ");
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleEquipment(key)}
                className={`h-11 px-3 text-xs font-semibold rounded-lg border capitalize text-left flex items-center justify-between ${
                  isSelected ? "bg-primary/10 border-primary text-primary" : "bg-accent/20 border-border text-muted-foreground"
                }`}
              >
                <span>{label}</span>
                <span className="text-[9px] uppercase font-bold">{isSelected ? "Yes" : "No"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements builder */}
      <div className="space-y-3">
        <Label>Awards & Achievements</Label>
        <div className="flex gap-2">
          <Input 
            placeholder="E.g. Best Rock Band - Bangalore Music Awards 2025" 
            value={newAchievement}
            onChange={e => setNewAchievement(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAchievement();
              }
            }}
          />
          <Button type="button" onClick={addAchievement} className="bg-primary text-primary-foreground h-10 px-4">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {watchedAchievements.map((ach, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-accent/20">
              <span className="text-xs text-foreground">{ach}</span>
              <button type="button" onClick={() => removeAchievement(idx)} className="text-error hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {watchedAchievements.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No achievements added yet.</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 flex items-center justify-center gap-2">
        <Save className="h-4 w-4" />
        <span>{isSubmitting ? "Saving Updates..." : "Save Profile Changes"}</span>
      </Button>

    </form>
  );
}
