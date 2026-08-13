import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { Plus, Search, Edit, Trash2, BookOpen, Clock, IndianRupee } from 'lucide-react';

const CoursesPage = () => {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    duration: '',
    totalFees: '',
    status: 'ACTIVE'
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses', { params: { search } });
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenAddModal = () => {
    setSelectedCourse(null);
    setFormData({
      courseName: '',
      description: '',
      duration: '6 Months',
      totalFees: 45000,
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      courseName: course.courseName,
      description: course.description || '',
      duration: course.duration,
      totalFees: course.totalFees,
      status: course.status
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (selectedCourse) {
        await api.put(`/courses/${selectedCourse._id}`, formData);
        showToast('Course updated successfully!');
      } else {
        await api.post('/courses', formData);
        showToast('Course created successfully!');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/courses/${selectedCourse._id}`);
      showToast('Course deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchCourses();
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
          <h1 className="text-2xl font-bold text-slate-800">Course Catalog</h1>
          <p className="text-sm text-slate-500">Manage technical training programs, syllabus durations, and course fee structures</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
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
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching courses..." />
      ) : courses.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border border-slate-200">No courses available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <Badge type={course.status} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{course.courseName}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{course.description || 'No description provided.'}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="flex items-center text-xs font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {course.duration}
                  </span>
                  <span className="flex items-center text-sm font-extrabold text-emerald-600">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {formatCurrency(course.totalFees)}
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(course)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCourse ? 'Edit Course' : 'Create New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Course Name</label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Duration</label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 6 Months"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Total Fees (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.totalFees}
                onChange={(e) => setFormData({ ...formData, totalFees: e.target.value })}
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
              {submitting ? 'Saving...' : 'Save Course'}
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
            Are you sure you want to delete course <strong className="text-slate-800">{selectedCourse?.courseName}</strong>?
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

export default CoursesPage;
