import { ReactNode, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Accessible modal: escape-to-close, body scroll lock, click-outside, animated.
 * Renders as a bottom sheet on mobile and a centered dialog on larger screens.
 */
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const w = size === 'lg' ? 'sm:max-w-3xl' : size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-lg';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md et-fade" onClick={onClose} />
      <div
        className={`relative w-full ${w} et-card et-pop rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col`}
      >
        {(title || true) && (
          <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-3 border-b border-purple-500/15">
            <div className="min-w-0">
              {title && (
                <h3 className="font-display text-base sm:text-lg tracking-[0.12em] text-purple-50 truncate">
                  {title}
                </h3>
              )}
              {subtitle && <p className="mt-1 font-tech text-xs text-purple-200/55 truncate">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 p-2 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-200 hover:text-white hover:border-purple-400/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 sm:px-6 py-5">{children}</div>
        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-purple-500/15 bg-[#07060f]/60 rounded-b-2xl flex flex-col sm:flex-row gap-3 sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = true,
  loading = false,
}: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-100 hover:bg-purple-500/15 font-tech text-sm tracking-wide transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 rounded-xl font-tech text-sm tracking-wide text-white transition-colors disabled:opacity-60 ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
            }`}
            style={{ boxShadow: danger ? '0 8px 22px -8px rgba(239,68,68,.7)' : '0 8px 22px -8px rgba(124,58,237,.7)' }}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 h-11 w-11 grid place-items-center rounded-xl ${
            danger ? 'bg-red-500/15 text-red-300' : 'bg-purple-500/15 text-purple-300'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="font-tech text-sm text-purple-200/75 leading-relaxed pt-1.5">{message}</p>
      </div>
    </Modal>
  );
}
