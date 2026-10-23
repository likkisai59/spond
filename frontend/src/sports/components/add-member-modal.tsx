"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Form, FormInput, FormSelect } from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectGroupById } from "@/store/sports/selectors";
import { notificationAdded } from "@/store/slices/notification-slice";
import { addMemberThunk } from "@/store/sports/groups-slice";
import { addMemberSchema, type AddMemberFormData } from "../schemas";

export interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
}

export function AddMemberModal({
  open,
  onOpenChange,
  groupId,
  groupName,
}: AddMemberModalProps) {
  const dispatch = useAppDispatch();
  const group = useAppSelector((state) => selectGroupById(state, groupId));

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", role: "Member" },
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = form;

  const emailValue = form.watch("email");
  useEffect(() => {
    if (!emailValue) return;
    const isAlreadyMember = group?.members?.some(
      (m) => m.email?.toLowerCase() === emailValue.trim().toLowerCase()
    );
    if (isAlreadyMember) {
      setError("email", {
        type: "manual",
        message: "Email already registered",
      });
    } else if (errors.email?.message === "Email already registered") {
      clearErrors("email");
    }
  }, [emailValue, group?.members, setError, clearErrors, errors.email?.message]);

  const handleClose = (next: boolean) => {
    if (!next) {
      reset();
      setInviteLink(null);
      setCopied(false);
    }
    onOpenChange(next);
  };

  const onSubmit = async (data: AddMemberFormData) => {
    const isAlreadyMember = group?.members?.some(
      (m) => m.email?.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (isAlreadyMember) {
      setError("email", {
        type: "manual",
        message: "Email already registered",
      });
      return;
    }

    try {
      const res: any = await dispatch(
        addMemberThunk({
          groupId,
          input: {
            name: data.name.trim(),
            email: data.email.trim(),
            role: data.role,
          },
        })
      ).unwrap();

      const token = res?.latest_invite_token;
      if (token && typeof window !== "undefined") {
        setInviteLink(`${window.location.origin}/sports/invite/${token}`);
      }

      dispatch(
        notificationAdded({
          title: "Invitation sent",
          message: `An invitation email has been sent to ${data.email.trim()}. You can also copy the direct link.`,
          variant: "success",
        })
      );
      if (!token) {
        reset();
        onOpenChange(false);
      }
    } catch (error: any) {
      const msg = error?.message || "";
      if (
        msg.toLowerCase().includes("already a member") ||
        msg.toLowerCase().includes("already registered")
      ) {
        setError("email", {
          type: "manual",
          message: "Email already registered",
        });
        return;
      }
      dispatch(
        notificationAdded({
          title: "Error adding member",
          message: msg || "Something went wrong",
          variant: "error",
        })
      );
    }
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Add member</ModalTitle>
          <ModalDescription>
            Invite a new member to {groupName}. An invitation email with Accept and Reject buttons will be sent to their email address.
          </ModalDescription>
        </ModalHeader>

        {inviteLink ? (
          <div className="space-y-4 py-2 animate-fade-in">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm">
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                ✓ Invitation generated successfully!
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Share this direct invitation link with the member via WhatsApp or message:
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input value={inviteLink} readOnly className="font-mono text-xs" />
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <ModalFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Done
              </Button>
            </ModalFooter>
          </div>
        ) : (

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormInput
              control={control}
              name="name"
              label="Full name"
              placeholder="e.g. Priya Sharma"
              autoComplete="name"
            />
            <FormInput
              control={control}
              name="email"
              label="Email"
              type="email"
              placeholder="priya@gmail.com"
              autoComplete="email"
            />
            <FormSelect
              control={control}
              name="role"
              label="Role"
              placeholder="Select a role"
              options={[
                { label: "Group Member", value: "Member" },
              ]}
            />
            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="accent" loading={isSubmitting}>
                <UserPlus />
                Send invite
              </Button>
            </ModalFooter>
          </form>
        </Form>
        )}
      </ModalContent>
    </Modal>
  );
}
