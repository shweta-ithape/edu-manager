import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import { Plus, UserCheck, Trash2, CheckCircle } from 'lucide-react';

const EnrollmentsPage = () => {
  const { isAdmin } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    batchId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollRes, studentRes, batchRes] = await Promise.all([
        api.get('/enrollments'),
        api.get('/students?status=ACTIVE&limit=100'),
        api.get('/batches?status=ACTIVE')
      ]);

      if (enrollRes.data.success) setEnrollments(enrollRes.data.data);
      if (studentRes.data.success) setStudents(studentRes.data.data);
      if (batchRes.data.success) setBatches(batchRes.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch enrollment records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenEnrollModal = () => {
    setFormData({
      studentId: students[0]?._id || '',
      batchId: batches[0]?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/enrollments', formData);
      showToast('Student enrolled successfully!');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Enrollment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/enrollments/${id}`, { status: newStatus });
      showToast(`Enrollment status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/enrollments/${selectedEnrollment._id}`);
      showToast('Enrollment deleted successfully');
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
          <h1 className="text-2xl font-bold text-slate-800">Batch Enrollments</h1>
          <p className="text-sm text-slate-500">Enroll active students into institute batches with capacity validations</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenEnrollModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching enrollments..." />
        ) : enrollments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No enrollment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Enrollment Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.student?.name || 'N/A'}</div>
                      <div className="text-xs font-mono text-slate-400">{item.student?.studentId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{item.batch?.batchName || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-blue-600 font-semibold text-xs">{item.batch?.course?.courseName || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{formatDate(item.enrollmentDate)}</td>
                    <td className="py-3.5 px-4"><Badge type={item.status} /></td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {item.status === 'ENROLLED' && (
                          <button
                            onClick={() => handleStatusChange(item._id, 'COMPLETED')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDeleteModal(item)}
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

      {/* Enroll Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll Student in Batch"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Student</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.studentId}) - {s.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Batch</label>
            <select
              required
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Batch</option>
              {batches.map(b => (
                <option key={b._id} value={b._id}>{b.batchName} ({b.course?.courseName}) - Capacity: {b.enrolledCount || 0}/{b.capacity}</option>
              ))}
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
              {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
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
            Are you sure you want to delete this enrollment record?
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

export default EnrollmentsPage;
