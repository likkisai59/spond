"use client";

import * as React from "react";
import { Check } from "lucide-react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "./form";
import { cn } from "@/utils/cn";

export interface FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues
> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: React.ReactNode;
  className?: string;
}

export function FormCheckbox<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  className,
}: FormCheckboxProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <label
            className={cn(
              "flex cursor-pointer items-start gap-2.5 select-none",
              className
            )}
          >
            <FormControl>
              <input
                type="checkbox"
                className="peer sr-only"
                checked={Boolean(field.value)}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                disabled={field.disabled}
                ref={field.ref}
              />
            </FormControl>
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-input bg-card transition-all peer-checked:border-transparent peer-checked:bg-brand-gradient peer-checked:[&>svg]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">
              <Check className="h-3.5 w-3.5 text-white opacity-0 transition-opacity" />
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">
              {label}
            </span>
          </label>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
