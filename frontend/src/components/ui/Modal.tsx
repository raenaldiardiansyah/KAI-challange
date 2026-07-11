import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./Button";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose();
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal">
        <div className="card-header">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Close asChild>
            <Button variant="ghost">Tutup</Button>
          </Dialog.Close>
        </div>
        {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
