import React from 'react';

const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
