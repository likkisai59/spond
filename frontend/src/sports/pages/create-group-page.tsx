"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Globe, ImagePlus, Lock, Trash2 } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import {
  Form,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/forms";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { groupAdded } from "@/store/sports/groups-slice";
import { createGroupSchema, type CreateGroupFormData } from "../schemas";
import { GROUP_CATEGORIES, SPORT_TYPES } from "@/types";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

const MAX_LOGO_SIZE_KB = 2048;

const VISIBILITY_OPTIONS = [
  {
    value: "Public",
    icon: Globe,
    title: "Public",
    description: "Anyone can find and join this group.",
  },
  {
    value: "Private",
    icon: Lock,
    title: "Private",
    description: "Members join only by invitation.",
  },
] as const;

export function CreateGroupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);

  const form = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      sportType: undefined,
      category: undefined,
      location: "",
      visibility: "Public",
    },
  });
  const { control, handleSubmit, formState, watch, setValue } = form;
  const visibility = watch("visibility");

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      dispatch(
        notificationAdded({
          title: "Invalid file",
          message: "Group logos must be PNG or JPG images.",
          variant: "info",
        })
      );
      return;
    }
    if (file.size > MAX_LOGO_SIZE_KB * 1024) {
      dispatch(
        notificationAdded({
          title: "Logo too large",
          message: "Please pick an image under 2 MB.",
          variant: "info",
        })
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(typeof reader.result === "string" ? reader.result : null);
      setLogoName(file.name);
      dispatch(
        notificationAdded({
          title: "Logo ready",
          message: `${file.name} will be used as the group logo.`,
          variant: "success",
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoName(null);
  };

  const onSubmit: SubmitHandler<CreateGroupFormData> = (data) => {
    const action = dispatch(groupAdded(data));
    dispatch(
      notificationAdded({
        title: "Group created",
        message: `${data.name} is ready. Invite members to get started.`,
        variant: "success",
      })
    );
    router.push(`${ROUTES.SPORTS_GROUPS}/${action.payload.id}`);
  };

  return (
    <PageContainer as="main" className="max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Groups", href: ROUTES.SPORTS_GROUPS },
          { label: "Create" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Create a group"
        description="Set up a team, club or training squad in under a minute."
        actions={
          <Button asChild variant="ghost">
            <Link href={ROUTES.SPORTS_GROUPS}>
              <ArrowLeft />
              Back to groups
            </Link>
          </Button>
        }
      />

      <Card className="mt-8 animate-fade-in-up p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormInput
              control={control}
              name="name"
              label="Group name"
              placeholder="e.g. Strikers FC"
            />
            <FormTextarea
              control={control}
              name="description"
              label="Description"
              placeholder="What is this group about?"
              rows={4}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <FormSelect
                control={control}
                name="sportType"
                label="Sport type"
                placeholder="Select a sport"
                options={SPORT_TYPES.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />
              <FormSelect
                control={control}
                name="category"
                label="Category"
                placeholder="Select a category"
                options={GROUP_CATEGORIES.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />
            </div>
            <FormInput
              control={control}
              name="location"
              label="City"
              placeholder="e.g. Mumbai, MH"
            />

            <div className="space-y-2">
              <p className="text-sm font-semibold">Group logo</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleLogoChange}
                aria-hidden="true"
                tabIndex={-1}
              />
              {logoPreview ? (
                <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-muted/30 px-4 py-4">
                  <Avatar className="h-16 w-16 rounded-2xl">
                    <AvatarImage src={logoPreview} alt="Group logo preview" />
                    <AvatarFallback className="rounded-2xl">GL</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{logoName}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-3.5 w-3.5" />
                      Logo ready to save
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => inputRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleRemoveLogo}
                      aria-label="Remove logo"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/40 px-4 py-8 transition-colors hover:border-accent/50 hover:bg-brand-gradient-soft"
                >
                  <ImagePlus className="h-7 w-7 text-accent" />
                  <span className="text-sm font-semibold">
                    Click to upload a logo
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG or JPG, up to 2 MB
                  </span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Visibility</p>
              <div
                role="radiogroup"
                aria-label="Group visibility"
                className="grid gap-3 sm:grid-cols-2"
              >
                {VISIBILITY_OPTIONS.map((option) => {
                  const active = visibility === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        setValue("visibility", option.value, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "flex items-start gap-3 rounded-xl border px-4 py-4 text-left transition-all",
                        active
                          ? "border-accent/50 bg-brand-gradient-soft shadow-sm"
                          : "border-border/70 hover:border-accent/40 hover:bg-muted/50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          active
                            ? "bg-brand-gradient text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <option.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">
                          {option.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                      {active ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {formState.errors.visibility ? (
                <p className="text-sm font-medium text-destructive">
                  {formState.errors.visibility.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href={ROUTES.SPORTS_GROUPS}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={formState.isSubmitting}
              >
                Create group
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </PageContainer>
  );
}
