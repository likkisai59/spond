"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import {
  Form,
  FormCheckbox,
  FormInput,
  FormSelect,
} from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { pollAdded, createPollThunk } from "@/store/sports/polls-slice";
import { selectAllGroups } from "@/store/sports/selectors";
import { createPollSchema, type CreatePollFormData } from "../schemas";
import { ROUTES } from "@/constants";

export function CreatePollPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectAllGroups);

  const form = useForm<CreatePollFormData>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      groupId: "",
      question: "",
      options: [{ label: "" }, { label: "" }],
      multipleChoice: false,
      expiresAt: "",
    },
  });
  const { control, handleSubmit, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "options" });

  const onSubmit: SubmitHandler<CreatePollFormData> = async (data) => {
    try {
      await dispatch(
        createPollThunk({
          groupId: data.groupId,
          question: data.question,
          optionLabels: data.options.map((option) => option.label),
          multipleChoice: data.multipleChoice,
          expiresAt: data.expiresAt,
        })
      ).unwrap();
    } catch {
      dispatch(
        pollAdded({
          groupId: data.groupId,
          question: data.question,
          optionLabels: data.options.map((option) => option.label),
          multipleChoice: data.multipleChoice,
          expiresAt: data.expiresAt,
        })
      );
    }
    dispatch(
      notificationAdded({
        title: "Poll created",
        message: "Members can start voting right away.",
        variant: "success",
      })
    );
    router.push(ROUTES.SPORTS_POLLS);
  };

  return (
    <PageContainer as="main" className="max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Polls", href: ROUTES.SPORTS_POLLS },
          { label: "Create" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Create a poll"
        description="Ask members anything and watch the votes roll in."
        actions={
          <Button asChild variant="ghost">
            <Link href={ROUTES.SPORTS_POLLS}>
              <ArrowLeft />
              Back to polls
            </Link>
          </Button>
        }
      />

      <Card className="mt-8 animate-fade-in-up p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormSelect
              control={control}
              name="groupId"
              label="Group"
              placeholder="Select a group"
              options={groups.map((group) => ({
                label: group.name,
                value: group.id,
              }))}
            />

            <FormInput
              control={control}
              name="question"
              label="Question"
              placeholder="e.g. Which venue for the October friendly?"
            />

            <div className="space-y-3">
              <p className="text-sm font-semibold">Options</p>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <FormInput
                      control={control}
                      name={`options.${index}.label`}
                      placeholder={`Option ${index + 1}`}
                      aria-label={`Option ${index + 1}`}
                    />
                  </div>
                  {fields.length > 2 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-0.5 shrink-0 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(index)}
                      aria-label={`Remove option ${index + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  ) : null}
                </div>
              ))}
              {fields.length < 6 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => append({ label: "" })}
                >
                  <Plus />
                  Add option
                </Button>
              ) : null}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormInput
                control={control}
                name="expiresAt"
                label="Expiry date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
              />
              <div className="flex items-end pb-1">
                <FormCheckbox
                  control={control}
                  name="multipleChoice"
                  label="Allow multiple choices"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href={ROUTES.SPORTS_POLLS}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={formState.isSubmitting}
              >
                Create poll
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </PageContainer>
  );
}
