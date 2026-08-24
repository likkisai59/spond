"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Form, FormInput, FormSelect } from "@/components/forms";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { memberAdded } from "@/store/sports/groups-slice";
import { addMemberSchema, type AddMemberFormData } from "../schemas";
import { MEMBER_ROLES } from "@/types";

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

  const form = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { name: "", email: "", role: "Member" },
  });

  const { control, handleSubmit, reset, formState: { isSubmitting } } = form;

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onSubmit = async (data: AddMemberFormData) => {
    dispatch(
      memberAdded({
        groupId,
        member: {
          id: `mem-${Date.now()}`,
          name: data.name.trim(),
          email: data.email.trim(),
          role: data.role,
          status: "Invited",
          joinedAt: new Date().toISOString().slice(0, 10),
        },
      })
    );
    dispatch(
      notificationAdded({
        title: "Member invited",
        message: `${data.name.trim()} was invited to ${groupName} as ${data.role} (demo mode).`,
        variant: "success",
      })
    );
    reset();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Add member</ModalTitle>
          <ModalDescription>
            Invite a new member to {groupName}. They appear with status
            “Invited” until they join (demo mode).
          </ModalDescription>
        </ModalHeader>

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
              placeholder="priya@example.com"
              autoComplete="email"
            />
            <FormSelect
              control={control}
              name="role"
              label="Role"
              placeholder="Select a role"
              options={MEMBER_ROLES.map((role) => ({
                label: role,
                value: role,
              }))}
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
      </ModalContent>
    </Modal>
  );
}
