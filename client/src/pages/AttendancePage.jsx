import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Toast from '../components/Toast';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateForInput } from '../utils/formatters';
import { ClipboardList, Check, X, Save, Percent } from 'lucide-react';

const AttendancePage = () => {
  const { isStudent } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));
  const [records, setRecords] = useState([]); // [{ studentId, name, studentCode, status }]
  const [batchSummary, setBatchSummary] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [studentAttendanceLogs, setStudentAttendanceLogs] = useState([]);
  const [studentSummary, setStudentSummary] = useState(null);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      if (res.data.success) {
        setBatches(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedBatchId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      showToast('Failed to fetch batches', 'error');
    }
  };

  const fetchStudentOwnAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance');
      if (res.data.success) {
        setStudentAttendanceLogs(res.data.data);
        setStudentSummary(res.data.summary);
      }
    } catch (err) {
      showToast('Failed to load attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStudent) {
      fetchStudentOwnAttendance();
    } else {
      fetchBatches();
    }
  }, [isStudent]);

  const fetchBatchAttendanceForDate = async () => {
    if (!selectedBatchId) return;
    try {
      setLoading(true);
      // 1. Fetch batch enrollment student summary
      const summaryRes = await api.get(`/attendance/batch-summary/${selectedBatchId}`);
      if (summaryRes.data.success) {
        setBatchSummary(summaryRes.data.data);
      }

      // 2. Fetch existing attendance for selected date
      const attRes = await api.get('/attendance', {
        params: { batchId: selectedBatchId, date: selectedDate }
      });

      const existingAttMap = {};
      if (attRes.data.success) {
        attRes.data.data.forEach(item => {
          existingAttMap[item.student._id || item.student] = item.status;
        });
      }

      // Populate editable records
      const initialRecords = (summaryRes.data.data || []).map(item => ({
        studentId: item.studentId,
        studentCode: item.studentCode,
        name: item.name,
        email: item.email,
        status: existingAttMap[item.studentId] || 'PRESENT'
      }));

      setRecords(initialRecords);
    } catch (err) {
      showToast('Error loading batch attendance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isStudent && selectedBatchId) {
      fetchBatchAttendanceForDate();
    }
  }, [selectedBatchId, selectedDate, isStudent]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleStatusToggle = (index, newStatus) => {
    const updated = [...records];
    updated[index].status = newStatus;
    setRecords(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      setSubmitting(true);
      const payload = {
        batchId: selectedBatchId,
        date: selectedDate,
        records: records.map(r => ({ studentId: r.studentId, status: r.status }))
      };

      const res = await api.post('/attendance', payload);
      if (res.data.success) {
        showToast(`Attendance saved successfully for ${res.data.count} student(s)!`);
        fetchBatchAttendanceForDate();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isStudent) {
    return (
      <div className="space-y-6">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

        {/* Student Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Attendance Log</h1>
          <p className="text-sm text-slate-500">Track your daily session attendance records & attendance percentage</p>
        </div>

        {/* Summary Card */}
        {studentSummary && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Total Attendance Rate</p>
              <h2 className="text-3xl font-extrabold text-slate-800">{studentSummary.percentage}%</h2>
              <p className="text-xs text-slate-500 mt-1">{studentSummary.presentClasses} Present / {studentSummary.totalClasses} Total Sessions</p>
            </div>
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
              <Percent className="w-8 h-8" />
            </div>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <LoadingSpinner text="Fetching attendance records..." />
          ) : studentAttendanceLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No attendance logs available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAttendanceLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-medium text-slate-800">{formatDate(log.date)}</td>
                      <td className="py-3.5 px-4 text-slate-600">{log.batch?.batchName}</td>
                      <td className="py-3.5 px-4"><Badge type={log.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Management</h1>
          <p className="text-sm text-slate-500">Mark daily student attendance for assigned batches & view summary percentages</p>
        </div>
      </div>

      {/* Batch & Date Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Batch</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {batches.map(b => (
              <option key={b._id} value={b._id}>{b.batchName} ({b.course?.courseName})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Attendance Marking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Student Marking List</h3>
            <p className="text-xs text-slate-400">Recording attendance for {formatDate(selectedDate)}</p>
          </div>
          <button
            onClick={handleSaveAttendance}
            disabled={submitting || records.length === 0}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching batch students..." />
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No active students enrolled in this batch.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Overall %</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((student, idx) => {
                  const summaryItem = batchSummary.find(s => s.studentId === student.studentId);
                  return (
                    <tr key={student.studentId} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-600">{student.studentCode}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{student.name}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{summaryItem ? `${summaryItem.percentage}%` : '0%'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(idx, 'PRESENT')}
                            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all ${
                              student.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>PRESENT</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(idx, 'ABSENT')}
                            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all ${
                              student.status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>ABSENT</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
