import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-xl border text-sm font-medium transition-all ${
      isSuccess
        ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
        : 'bg-rose-900 text-rose-100 border-rose-700'
    }`}>
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-400 mr-3 flex-shrink-0" />
      )}
      <span className="mr-4">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-75">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
