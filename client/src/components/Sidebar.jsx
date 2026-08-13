import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  UserCheck,
  ClipboardList,
  IndianRupee,
  Award,
  FileBarChart,
  User,
  LogOut,
  Shield
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/dashboard/admin';
    if (role === 'TRAINER') return '/dashboard/trainer';
    if (role === 'STUDENT') return '/dashboard/student';
    return '/login';
  };

  const navItems = [
    {
      title: 'Dashboard',
      path: getDashboardPath(),
      icon: LayoutDashboard,
      roles: ['ADMIN', 'TRAINER', 'STUDENT']
    },
    {
      title: 'Students',
      path: '/students',
      icon: Users,
      roles: ['ADMIN', 'TRAINER']
    },
    {
      title: 'Trainers',
      path: '/trainers',
      icon: GraduationCap,
      roles: ['ADMIN']
    },
    {
      title: 'Courses',
      path: '/courses',
      icon: BookOpen,
      roles: ['ADMIN', 'TRAINER', 'STUDENT']
    },
    {
      title: 'Batches',
      path: '/batches',
      icon: CalendarDays,
      roles: ['ADMIN', 'TRAINER']
    },
    {
      title: 'Enrollments',
      path: '/enrollments',
      icon: UserCheck,
      roles: ['ADMIN']
    },
    {
      title: 'Attendance',
      path: '/attendance',
      icon: ClipboardList,
      roles: ['ADMIN', 'TRAINER', 'STUDENT']
    },
    {
      title: 'Fee Management',
      path: '/fees',
      icon: IndianRupee,
      roles: ['ADMIN', 'STUDENT']
    },
    {
      title: 'Results & Marks',
      path: '/results',
      icon: Award,
      roles: ['ADMIN', 'TRAINER', 'STUDENT']
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: FileBarChart,
      roles: ['ADMIN', 'TRAINER']
    },
    {
      title: 'My Profile',
      path: '/profile',
      icon: User,
      roles: ['ADMIN', 'TRAINER', 'STUDENT']
    }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">EduManager Pro</h1>
              <p className="text-[10px] text-slate-400 font-medium">Training Institute MVP</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => toggleSidebar(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
