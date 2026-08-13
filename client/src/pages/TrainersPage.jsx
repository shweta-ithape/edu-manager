import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateForInput } from '../utils/formatters';
import { Plus, Search, Filter, Edit, Trash2, GraduationCap } from 'lucide-react';

const TrainersPage = () => {
  const { isAdmin } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    trainerId: '',
    name: '',
    email: '',
    phone: '',
    specialization: '',
    joiningDate: '',
    status: 'ACTIVE',
    password: ''
  });

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainers', { params: { search, status } });
      if (res.data.success) {
        setTrainers(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch trainers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [search, status]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenAddModal = () => {
    setSelectedTrainer(null);
    setFormData({
      trainerId: `TRN${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      email: '',
      phone: '',
      specialization: '',
      joiningDate: formatDateForInput(new Date()),
      status: 'ACTIVE',
      password: 'password123'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (trainer) => {
    setSelectedTrainer(trainer);
    setFormData({
      trainerId: trainer.trainerId,
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
      joiningDate: formatDateForInput(trainer.joiningDate),
      status: trainer.status,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (trainer) => {
    setSelectedTrainer(trainer);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (selectedTrainer) {
        await api.put(`/trainers/${selectedTrainer._id}`, formData);
        showToast('Trainer updated successfully!');
      } else {
        await api.post('/trainers', formData);
        showToast('Trainer registered successfully!');
      }
      setIsModalOpen(false);
      fetchTrainers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/trainers/${selectedTrainer._id}`);
      showToast('Trainer record deleted!');
      setIsDeleteModalOpen(false);
      fetchTrainers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty & Trainers</h1>
          <p className="text-sm text-slate-500">Manage institute instructors, specializations, and access accounts</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trainer</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialization, ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching trainer directory..." />
        ) : trainers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No trainers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-3.5 px-4">Trainer ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trainers.map((trainer) => (
                  <tr key={trainer._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-purple-600">{trainer.trainerId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                        {trainer.name.charAt(0)}
                      </div>
                      <span>{trainer.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs">{trainer.specialization}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{trainer.email}</div>
                      <div className="text-slate-400">{trainer.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{formatDate(trainer.joiningDate)}</td>
                    <td className="py-3.5 px-4"><Badge type={trainer.status} /></td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(trainer)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(trainer)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTrainer ? 'Edit Trainer Details' : 'Register New Trainer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Trainer ID</label>
              <input
                type="text"
                required
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Specialization</label>
            <input
              type="text"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. MERN Stack, Data Science & AI"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Joining Date</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {!selectedTrainer && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Default Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Default: password123"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Trainer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete trainer <strong className="text-slate-800">{selectedTrainer?.name}</strong>?
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-500 disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TrainersPage;
