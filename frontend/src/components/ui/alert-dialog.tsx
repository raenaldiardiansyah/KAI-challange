"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const AlertDialog = Dialog.Root;
const AlertDialogTrigger = Dialog.Trigger;

const AlertDialogContent = forwardRef<
  ElementRef<typeof Dialog.Content>,
  ComponentPropsWithoutRef<typeof Dialog.Content> & { size?: "default" | "sm" }
>(({ className, children, size = "default", ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="alert-dialog-backdrop" />
    <Dialog.Content
      ref={ref}
      className={cn("alert-dialog-content", size === "sm" && "alert-dialog-content-sm", className)}
      {...props}
    >
      {children}
    </Dialog.Content>
  </Dialog.Portal>
));
AlertDialogContent.displayName = "AlertDialogContent";

function AlertDialogHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("alert-dialog-header", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("alert-dialog-footer", className)} {...props} />;
}

const AlertDialogTitle = forwardRef<
  ElementRef<typeof Dialog.Title>,
  ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title ref={ref} className={cn("alert-dialog-title", className)} {...props} />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = forwardRef<
  ElementRef<typeof Dialog.Description>,
  ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description ref={ref} className={cn("alert-dialog-description", className)} {...props} />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

function AlertDialogCancel({ className, children, ...props }: ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Dialog.Close asChild>
      <Button variant="ghost" className={className} {...props}>
        {children}
      </Button>
    </Dialog.Close>
  );
}

function AlertDialogAction({ className, children, ...props }: ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Button className={className} {...props}>
      {children}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
};
