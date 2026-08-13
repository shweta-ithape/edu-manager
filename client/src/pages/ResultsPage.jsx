import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Award, Plus, Filter, Eye, Trash2, PlusCircle, Trash } from 'lucide-react';

const ResultsPage = () => {
  const { user, isAdmin, isTrainer, isStudent } = useAuth();
  const [results, setResults] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    batchId: '',
    subjectMarks: [
      { subject: 'Theory & Concepts', marksObtained: 75, maxMarks: 100 },
      { subject: 'Practical Lab Test', marksObtained: 80, maxMarks: 100 }
    ],
    remarks: ''
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get('/results', { params: { resultStatus: statusFilter } });
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormMetadata = async () => {
    if (isStudent) return;
    try {
      const [batchRes, studentRes] = await Promise.all([
        api.get('/batches'),
        api.get('/students?status=ACTIVE&limit=100')
      ]);
      if (batchRes.data.success) setBatches(batchRes.data.data);
      if (studentRes.data.success) setStudents(studentRes.data.data);
    } catch (err) {
      console.error('Metadata load error:', err);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchFormMetadata();
  }, [statusFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenEntryModal = () => {
    setSelectedResult(null);
    setFormData({
      studentId: students[0]?._id || '',
      batchId: batches[0]?._id || '',
      subjectMarks: [
        { subject: 'Theory Assessment', marksObtained: 80, maxMarks: 100 },
        { subject: 'Practical Project', marksObtained: 85, maxMarks: 100 }
      ],
      remarks: 'Good progress'
    });
    setIsEntryModalOpen(true);
  };

  const handleAddSubjectField = () => {
    setFormData({
      ...formData,
      subjectMarks: [...formData.subjectMarks, { subject: '', marksObtained: 0, maxMarks: 100 }]
    });
  };

  const handleRemoveSubjectField = (index) => {
    const updated = formData.subjectMarks.filter((_, i) => i !== index);
    setFormData({ ...formData, subjectMarks: updated });
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...formData.subjectMarks];
    updated[index][field] = value;
    setFormData({ ...formData, subjectMarks: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate marks between 0 and 100
    for (const sub of formData.subjectMarks) {
      const m = Number(sub.marksObtained);
      if (isNaN(m) || m < 0 || m > 100) {
        showToast(`Invalid marks for subject '${sub.subject}'. Marks must be between 0 and 100.`, 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      await api.post('/results', formData);
      showToast('Result marks saved successfully!');
      setIsEntryModalOpen(false);
      fetchResults();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save result', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/results/${selectedResult._id}`);
      showToast('Result deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchResults();
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
          <h1 className="text-2xl font-bold text-slate-800">Academic Results & Marksheets</h1>
          <p className="text-sm text-slate-500">Record subject marks, calculate pass/fail status, and generate student performance records</p>
        </div>
        {(isAdmin || isTrainer) && (
          <button
            onClick={handleOpenEntryModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Marks</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Pass/Fail Statuses</option>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching academic results..." />
        ) : results.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No result records available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Total Marks</th>
                  <th className="py-3.5 px-4">Percentage</th>
                  <th className="py-3.5 px-4">Result Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((resItem) => (
                  <tr key={resItem._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>{resItem.student?.name || 'N/A'}</div>
                      <div className="text-xs font-mono text-slate-400">{resItem.student?.studentId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      <div>{resItem.batch?.batchName || 'N/A'}</div>
                      <div className="text-xs text-blue-600">{resItem.batch?.course?.courseName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{resItem.totalMarks}</td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-600">{resItem.percentage}%</td>
                    <td className="py-3.5 px-4"><Badge type={resItem.resultStatus} /></td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => { setSelectedResult(resItem); setIsViewModalOpen(true); }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Marksheet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { setSelectedResult(resItem); setIsDeleteModalOpen(true); }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enter Marks Modal */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Enter Student Exam Marks"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Student</label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Batch</label>
              <select
                required
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Batch</option>
                {batches.map(b => (
                  <option key={b._id} value={b._id}>{b.batchName} ({b.course?.courseName})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase text-slate-500">Subject Marks Breakdown</label>
              <button
                type="button"
                onClick={handleAddSubjectField}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Subject
              </button>
            </div>

            {formData.subjectMarks.map((sub, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="text"
                  required
                  placeholder="Subject Title"
                  value={sub.subject}
                  onChange={(e) => handleSubjectChange(idx, 'subject', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  placeholder="Marks (0-100)"
                  value={sub.marksObtained}
                  onChange={(e) => handleSubjectChange(idx, 'marksObtained', e.target.value)}
                  className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800"
                />
                {formData.subjectMarks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSubjectField(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Instructor Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Excellent performance in practical assessments."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEntryModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Result'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Marksheet View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Official Student Marksheet"
        maxWidth="max-w-lg"
      >
        {selectedResult && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{selectedResult.student?.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedResult.student?.studentId}</p>
                </div>
                <Badge type={selectedResult.resultStatus} />
              </div>
              <p className="text-xs text-blue-300">{selectedResult.batch?.batchName} - {selectedResult.batch?.course?.courseName}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold text-slate-400">Subject Breakdown</h4>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {selectedResult.subjectMarks?.map((sub, i) => (
                  <div key={i} className="flex justify-between p-3 text-sm">
                    <span className="font-medium text-slate-700">{sub.subject}</span>
                    <span className="font-bold text-slate-900">{sub.marksObtained} / {sub.maxMarks}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-xl text-slate-800">
              <span className="font-bold text-sm">Overall Percentage</span>
              <span className="text-2xl font-extrabold text-blue-600">{selectedResult.percentage}%</span>
            </div>

            {selectedResult.remarks && (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                "{selectedResult.remarks}"
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-slate-800 text-white font-semibold rounded-xl text-sm hover:bg-slate-700"
              >
                Close Marksheet
              </button>
            </div>
          </div>
        )}
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
            Are you sure you want to delete this result record for student <strong className="text-slate-800">{selectedResult?.student?.name}</strong>?
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

export default ResultsPage;
