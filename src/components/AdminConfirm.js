"use client";
import * as Dialog from "@radix-ui/react-dialog";

export default function AdminConfirm({ message, busy = false, onConfirm, onCancel }) {
  return <Dialog.Root open={!!message} onOpenChange={open => { if (!open && !busy) onCancel(); }}><Dialog.Portal>
    <Dialog.Overlay className="admin-confirm-overlay" />
    <Dialog.Content className="admin-confirm-dialog" aria-describedby="admin-confirm-description">
      <Dialog.Title>Confirm deletion</Dialog.Title>
      <Dialog.Description id="admin-confirm-description">{message}</Dialog.Description>
      <div className="admin-actions"><button type="button" disabled={busy} onClick={onCancel}>Keep record</button><button type="button" disabled={busy} onClick={onConfirm}>Delete permanently</button></div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}
