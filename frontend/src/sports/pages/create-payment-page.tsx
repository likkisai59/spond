"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import {
  Form,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { paymentAdded } from "@/store/sports/payments-slice";
import { selectAllGroups } from "@/store/sports/selectors";
import { createPaymentSchema, type CreatePaymentFormData } from "../schemas";
import { ROUTES } from "@/constants";

export function CreatePaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectAllGroups);

  const form = useForm<CreatePaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      groupId: "",
      title: "",
      amount: "" as unknown as number,
      dueDate: "",
      description: "",
    },
  });
  const { control, handleSubmit, formState } = form;

  const onSubmit: SubmitHandler<CreatePaymentFormData> = (data) => {
    dispatch(
      paymentAdded({
        groupId: data.groupId,
        title: data.title,
        amount: data.amount,
        dueDate: data.dueDate,
        description: data.description || undefined,
      })
    );
    dispatch(
      notificationAdded({
        title: "Payment request created",
        message: `“${data.title}” is now collecting in the selected group.`,
        variant: "success",
      })
    );
    router.push(ROUTES.SPORTS_PAYMENTS);
  };

  return (
    <PageContainer as="main" className="max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Payments", href: ROUTES.SPORTS_PAYMENTS },
          { label: "Create" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Request a payment"
        description="Collect fees, dues or contributions from group members."
        actions={
          <Button asChild variant="ghost">
            <Link href={ROUTES.SPORTS_PAYMENTS}>
              <ArrowLeft />
              Back to payments
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
              name="title"
              label="Payment title"
              placeholder="e.g. August — Pitch & Referee Fees"
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormInput
                control={control}
                name="amount"
                label="Amount (₹)"
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 1200"
              />
              <FormInput
                control={control}
                name="dueDate"
                label="Due date"
                type="date"
              />
            </div>

            <FormTextarea
              control={control}
              name="description"
              label="Description (optional)"
              placeholder="What is this payment for?"
              rows={3}
            />

            <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href={ROUTES.SPORTS_PAYMENTS}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={formState.isSubmitting}
              >
                <CreditCard />
                Create request
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </PageContainer>
  );
}
