import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorVariants = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-100',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-100',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-100',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-100',
    teal: 'bg-teal-500/10 text-teal-600 border-teal-100'
  };

  const selectedColor = colorVariants[color] || colorVariants.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-xl border ${selectedColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
