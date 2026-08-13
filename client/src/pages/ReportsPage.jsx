import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { exportToCsv } from '../utils/exportCsv';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Download, FileBarChart, Filter } from 'lucide-react';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'attendance', 'fees', 'results', 'batches'
  const [reportData, setReportData] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/batches');
        if (res.data.success) setBatches(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBatches();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedBatch) params.batchId = selectedBatch;
      if (selectedStatus) {
        if (activeTab === 'fees') params.paymentStatus = selectedStatus;
        else if (activeTab === 'results') params.resultStatus = selectedStatus;
        else params.status = selectedStatus;
      }

      const res = await api.get(`/reports/${activeTab}`, { params });
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, selectedBatch, selectedStatus]);

  const handleExportCsv = () => {
    if (!reportData || reportData.length === 0) return;

    let rows = [];
    if (activeTab === 'students') {
      rows = reportData.map(s => ({
        StudentID: s.studentId,
        Name: s.name,
        Email: s.email,
        Phone: s.phone,
        JoiningDate: formatDate(s.joiningDate),
        Status: s.status
      }));
    } else if (activeTab === 'attendance') {
      rows = reportData.map(a => ({
        Date: formatDate(a.date),
        StudentName: a.student?.name || '',
        StudentID: a.student?.studentId || '',
        Batch: a.batch?.batchName || '',
        Status: a.status
      }));
    } else if (activeTab === 'fees') {
      rows = reportData.map(f => ({
        StudentName: f.student?.name || '',
        StudentID: f.student?.studentId || '',
        Batch: f.batch?.batchName || '',
        TotalFee: f.totalFees,
        PaidAmount: f.paidAmount,
        PendingAmount: f.pendingAmount,
        PaymentStatus: f.paymentStatus
      }));
    } else if (activeTab === 'results') {
      rows = reportData.map(r => ({
        StudentName: r.student?.name || '',
        StudentID: r.student?.studentId || '',
        Batch: r.batch?.batchName || '',
        TotalMarks: r.totalMarks,
        Percentage: r.percentage,
        ResultStatus: r.resultStatus
      }));
    } else if (activeTab === 'batches') {
      rows = reportData.map(b => ({
        BatchName: b.batchName,
        Course: b.course?.courseName || '',
        Trainer: b.trainer?.name || '',
        Capacity: b.capacity,
        Enrolled: b.enrolledCount,
        Status: b.status
      }));
    }

    exportToCsv(`${activeTab}_report`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Institute Reporting & Analytics</h1>
          <p className="text-sm text-slate-500">Generate filterable tabular reports & export CSV data files</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={reportData.length === 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'students', label: 'Students Report' },
          { id: 'attendance', label: 'Attendance Report' },
          { id: 'fees', label: 'Fee Report' },
          { id: 'results', label: 'Result Report' },
          { id: 'batches', label: 'Batch Report' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedStatus(''); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase text-slate-500">Filter By:</span>
        </div>

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Batches</option>
          {batches.map(b => (
            <option key={b._id} value={b._id}>{b.batchName}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {activeTab === 'fees' ? (
            <>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PENDING">Pending</option>
            </>
          ) : activeTab === 'results' ? (
            <>
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
            </>
          ) : (
            <>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </>
          )}
        </select>
      </div>

      {/* Table Display */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Generating report data..." />
        ) : reportData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No records match the report criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                {activeTab === 'students' && (
                  <tr>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Joining Date</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                )}
                {activeTab === 'attendance' && (
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                )}
                {activeTab === 'fees' && (
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4">Total Fee</th>
                    <th className="py-3.5 px-4">Paid</th>
                    <th className="py-3.5 px-4">Pending</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                )}
                {activeTab === 'results' && (
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4">Total Marks</th>
                    <th className="py-3.5 px-4">Percentage</th>
                    <th className="py-3.5 px-4">Result</th>
                  </tr>
                )}
                {activeTab === 'batches' && (
                  <tr>
                    <th className="py-3.5 px-4">Batch Name</th>
                    <th className="py-3.5 px-4">Course</th>
                    <th className="py-3.5 px-4">Trainer</th>
                    <th className="py-3.5 px-4">Enrolled / Capacity</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {activeTab === 'students' && (
                      <>
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-600">{row.studentId}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{row.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.email}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.phone}</td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">{formatDate(row.joiningDate)}</td>
                        <td className="py-3.5 px-4"><Badge type={row.status} /></td>
                      </>
                    )}
                    {activeTab === 'attendance' && (
                      <>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{formatDate(row.date)}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{row.student?.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.batch?.batchName}</td>
                        <td className="py-3.5 px-4"><Badge type={row.status} /></td>
                      </>
                    )}
                    {activeTab === 'fees' && (
                      <>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{row.student?.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.batch?.batchName}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(row.totalFees)}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">{formatCurrency(row.paidAmount)}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-600">{formatCurrency(row.pendingAmount)}</td>
                        <td className="py-3.5 px-4"><Badge type={row.paymentStatus} /></td>
                      </>
                    )}
                    {activeTab === 'results' && (
                      <>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{row.student?.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.batch?.batchName}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.totalMarks}</td>
                        <td className="py-3.5 px-4 font-extrabold text-blue-600">{row.percentage}%</td>
                        <td className="py-3.5 px-4"><Badge type={row.resultStatus} /></td>
                      </>
                    )}
                    {activeTab === 'batches' && (
                      <>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{row.batchName}</td>
                        <td className="py-3.5 px-4 text-blue-600 font-semibold">{row.course?.courseName}</td>
                        <td className="py-3.5 px-4 text-slate-700">{row.trainer?.name}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{row.enrolledCount || 0} / {row.capacity}</td>
                        <td className="py-3.5 px-4"><Badge type={row.status} /></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
