// src/shared/components/ui/ConfirmDialog.tsx
// Confirmation built on Popup, so it keeps the same gestures (X, Escape, drag down, scrim tap).
import { Popup } from "@/shared/components/ui/Popup";
import { btnPrimary, btnSecondary } from "@/shared/components/ui/form-styles";

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <Popup open={open} onClose={onCancel} title={title}>
      <p className="whitespace-pre-line text-sm text-ink/80">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSecondary} onClick={onCancel}>{cancelLabel}</button>
        <button className={btnPrimary} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Popup>
  );
}
