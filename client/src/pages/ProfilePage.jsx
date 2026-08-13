import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Badge from '../components/Badge';
import { User, Lock, Mail, Shield, CheckCircle2 } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New password and confirm password do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data.success) {
        showToast('Password updated successfully!');
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Password update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Profile</h1>
        <p className="text-sm text-slate-500">View logged-in user profile details & security settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-5 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-3xl border border-blue-200">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
              <Badge type={user?.role} />
            </div>
            <p className="text-sm text-slate-500 flex items-center">
              <Mail className="w-4 h-4 mr-1.5 text-slate-400" /> {user?.email}
            </p>
          </div>
        </div>

        {/* Profile Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <p className="text-xs uppercase font-bold text-slate-400">Account Role</p>
            <p className="font-semibold text-slate-800 mt-1">{user?.role}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <p className="text-xs uppercase font-bold text-slate-400">Account Status</p>
            <p className="font-semibold text-emerald-600 mt-1">{user?.status || 'ACTIVE'}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Account Password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
