import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">
          Training Institute Management Platform
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            <Badge type={user.role} text={user.role} />
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800 leading-tight">{user.name}</span>
              <span className="text-[11px] text-slate-500 leading-tight">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
