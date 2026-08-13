import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { IndianRupee, Filter, CreditCard } from 'lucide-react';

const FeesPage = () => {
  const { isAdmin } = useAuth();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ totalCollected: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fees', { params: { paymentStatus: statusFilter } });
      if (res.data.success) {
        setFees(res.data.data);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      showToast('Failed to fetch fee records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenPaymentModal = (fee) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.paidAmount || '');
    setIsModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const paid = Number(paymentAmount);

    if (isNaN(paid) || paid < 0) {
      showToast('Payment amount cannot be negative', 'error');
      return;
    }

    if (paid > selectedFee.totalFees) {
      showToast(`Payment amount (₹${paid}) cannot exceed total fee (₹${selectedFee.totalFees})`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/fees/${selectedFee._id}`, { paidAmount: paid });
      showToast('Payment recorded successfully!');
      setIsModalOpen(false);
      fetchFees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment recording failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Fee & Payment Management</h1>
        <p className="text-sm text-slate-500">Track student tuition fee collections, pending balances, and payment logs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard title="Total Collected Fees" value={formatCurrency(summary.totalCollected)} icon={IndianRupee} color="green" />
        <StatCard title="Total Pending Fees" value={formatCurrency(summary.totalPending)} icon={IndianRupee} color="rose" />
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
            <option value="">All Payment Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching fee ledger..." />
        ) : fees.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No fee records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Total Fee</th>
                  <th className="py-3.5 px-4">Paid</th>
                  <th className="py-3.5 px-4">Pending</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>{fee.student?.name || 'N/A'}</div>
                      <div className="text-xs font-mono text-slate-400">{fee.student?.studentId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{fee.batch?.batchName || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(fee.totalFees)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{formatCurrency(fee.paidAmount)}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">{formatCurrency(fee.pendingAmount)}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{formatDate(fee.paymentDate)}</td>
                    <td className="py-3.5 px-4"><Badge type={fee.paymentStatus} /></td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenPaymentModal(fee)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold border border-blue-200 transition-colors flex items-center space-x-1 ml-auto"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
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

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Student Fee Payment"
      >
        {selectedFee && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800">{selectedFee.student?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch:</span>
                <span className="font-semibold text-slate-700">{selectedFee.batch?.batchName}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Total Course Fee:</span>
                <span className="font-bold text-slate-900">{formatCurrency(selectedFee.totalFees)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Updated Total Paid Amount (₹)</label>
              <input
                type="number"
                required
                min="0"
                max={selectedFee.totalFees}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Calculated Pending: <span className="font-bold text-rose-600">{formatCurrency(Math.max(0, selectedFee.totalFees - (Number(paymentAmount) || 0)))}</span>
              </p>
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
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Update Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default FeesPage;
