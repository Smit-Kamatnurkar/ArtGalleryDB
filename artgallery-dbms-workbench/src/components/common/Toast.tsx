import React from 'react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#2f312f] text-[#f2f1ee] shadow-2xl border border-white/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
      <span
        className={`material-symbols-outlined text-[18px] ${
          isError ? 'text-[#ffb4a5]' : isInfo ? 'text-[#ffdcc0]' : 'text-[#a4e2b0]'
        }`}
      >
        {isError ? 'error' : isInfo ? 'info' : 'check_circle'}
      </span>
      <span className="text-xs font-mono font-medium max-w-sm truncate">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-white/60 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};
