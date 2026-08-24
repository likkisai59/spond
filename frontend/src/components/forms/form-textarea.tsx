"use client";

import type {
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export interface FormTextareaProps<
  TFieldValues extends FieldValues = FieldValues
> extends Omit<TextareaProps, "name"> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
}

export function FormTextarea<
  TFieldValues extends FieldValues = FieldValues
>({ control, name, label, description, className, ...props }: FormTextareaProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Textarea className={className} {...field} {...props} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
