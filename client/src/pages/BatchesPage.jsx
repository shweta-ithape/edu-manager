import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateForInput } from '../utils/formatters';
import { Plus, Search, Edit, Trash2, Calendar, Users, Clock } from 'lucide-react';

const BatchesPage = () => {
  const { isAdmin } = useAuth();
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    batchName: '',
    courseId: '',
    trainerId: '',
    startDate: '',
    endDate: '',
    timing: '',
    capacity: 20,
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchRes, courseRes, trainerRes] = await Promise.all([
        api.get('/batches', { params: { search } }),
        api.get('/courses?status=ACTIVE'),
        api.get('/trainers?status=ACTIVE')
      ]);

      if (batchRes.data.success) setBatches(batchRes.data.data);
      if (courseRes.data.success) setCourses(courseRes.data.data);
      if (trainerRes.data.success) setTrainers(trainerRes.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch batch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenAddModal = () => {
    setSelectedBatch(null);
    const today = new Date();
    const future = new Date();
    future.setMonth(today.getMonth() + 4);

    setFormData({
      batchName: '',
      courseId: courses[0]?._id || '',
      trainerId: trainers[0]?._id || '',
      startDate: formatDateForInput(today),
      endDate: formatDateForInput(future),
      timing: '10:00 AM - 12:00 PM',
      capacity: 20,
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (batch) => {
    setSelectedBatch(batch);
    setFormData({
      batchName: batch.batchName,
      courseId: batch.course?._id || '',
      trainerId: batch.trainer?._id || '',
      startDate: formatDateForInput(batch.startDate),
      endDate: formatDateForInput(batch.endDate),
      timing: batch.timing,
      capacity: batch.capacity,
      status: batch.status
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (batch) => {
    setSelectedBatch(batch);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      showToast('End date cannot be before start date', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (selectedBatch) {
        await api.put(`/batches/${selectedBatch._id}`, formData);
        showToast('Batch updated successfully!');
      } else {
        await api.post('/batches', formData);
        showToast('Batch created successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/batches/${selectedBatch._id}`);
      showToast('Batch deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchData();
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
          <h1 className="text-2xl font-bold text-slate-800">Batch Management</h1>
          <p className="text-sm text-slate-500">Configure training schedules, assign instructors, and monitor enrollment capacities</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Batch</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batches..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching batch directory..." />
        ) : batches.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No batches found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-3.5 px-4">Batch Name</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Trainer</th>
                  <th className="py-3.5 px-4">Timing</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Enrolled / Capacity</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{batch.batchName}</td>
                    <td className="py-3.5 px-4 font-medium text-blue-600">{batch.course?.courseName || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-700">{batch.trainer?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{batch.timing}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-700">{batch.enrolledCount || 0} / {batch.capacity}</span>
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              (batch.enrolledCount || 0) >= batch.capacity ? 'bg-rose-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, ((batch.enrolledCount || 0) / batch.capacity) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><Badge type={batch.status} /></td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(batch)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(batch)}
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
        title={selectedBatch ? 'Edit Batch Configuration' : 'Create New Batch'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Batch Name</label>
            <input
              type="text"
              required
              value={formData.batchName}
              onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
              placeholder="e.g. MERN-2026-A1"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Course</label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.courseName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Assigned Trainer</label>
              <select
                required
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Trainer</option>
                {trainers.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.specialization})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Daily Timing</label>
              <input
                type="text"
                required
                value={formData.timing}
                onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                placeholder="e.g. 10:00 AM - 12:00 PM"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Capacity</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

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
              {submitting ? 'Saving...' : 'Save Batch'}
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
            Are you sure you want to delete batch <strong className="text-slate-800">{selectedBatch?.batchName}</strong>?
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

export default BatchesPage;
