import React from 'react';

const Badge = ({ type, text }) => {
  let colorClasses = 'bg-gray-100 text-gray-800 border-gray-300';
  const val = (text || type || '').toString().toUpperCase();

  switch (val) {
    case 'ACTIVE':
    case 'PAID':
    case 'PASS':
    case 'ENROLLED':
    case 'PRESENT':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/20';
      break;
    case 'PARTIAL':
    case 'COMPLETED':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/20';
      break;
    case 'INACTIVE':
    case 'PENDING':
    case 'FAIL':
    case 'ABSENT':
    case 'CANCELLED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/20';
      break;
    case 'ADMIN':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-600/20';
      break;
    case 'TRAINER':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/20';
      break;
    case 'STUDENT':
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-200 ring-1 ring-teal-600/20';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      {text || type}
    </span>
  );
};

export default Badge;
