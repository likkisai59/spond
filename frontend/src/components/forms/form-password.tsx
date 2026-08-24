"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export interface FormPasswordProps<
  TFieldValues extends FieldValues = FieldValues
> extends Omit<React.ComponentProps<"input">, "name" | "type"> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
}

export function FormPassword<
  TFieldValues extends FieldValues = FieldValues
>({ control, name, label, description, className, ...props }: FormPasswordProps<TFieldValues>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <div className="relative">
            <FormControl>
              <Input
                type={visible ? "text" : "password"}
                className={`${className ?? ""} pr-10`}
                {...field}
                {...props}
              />
            </FormControl>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
