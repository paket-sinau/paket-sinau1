/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'border-emerald-200 bg-white dark:bg-slate-900 dark:border-emerald-800 text-slate-800 dark:text-slate-100'
                : isError
                ? 'border-rose-200 bg-white dark:bg-slate-900 dark:border-rose-800 text-slate-800 dark:text-slate-100'
                : 'border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {isError && <AlertCircle className="h-5 w-5 text-rose-500" />}
              {!isSuccess && !isError && <Info className="h-5 w-5 text-indigo-500" />}
            </div>
            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
