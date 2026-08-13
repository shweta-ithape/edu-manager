import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-800">404 - Page Not Found</h1>
      <p className="text-slate-500 max-w-md text-sm">
        The requested URL or resource could not be located on the Training Institute Management Platform.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2 mt-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
