import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  UserCheck,
  IndianRupee,
  Percent,
  Award,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin analytics..." />;
  if (error) return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">{error}</div>;

  const { metrics, charts, recentActivity } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Control Center</h1>
        <p className="text-sm text-slate-500">Real-time institute operational statistics & financial summaries</p>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={metrics?.totalStudents || 0} icon={Users} color="blue" />
        <StatCard title="Active Trainers" value={metrics?.totalTrainers || 0} icon={GraduationCap} color="purple" />
        <StatCard title="Courses Offered" value={metrics?.totalCourses || 0} icon={BookOpen} color="teal" />
        <StatCard title="Active Batches" value={metrics?.activeBatches || 0} icon={CalendarDays} color="amber" />
        <StatCard title="Total Fees Collected" value={formatCurrency(metrics?.totalFeesCollected)} icon={IndianRupee} color="green" />
        <StatCard title="Total Pending Fees" value={formatCurrency(metrics?.totalPendingFees)} icon={IndianRupee} color="rose" />
        <StatCard title="Overall Attendance" value={`${metrics?.overallAttendancePercentage || 0}%`} icon={Percent} color="blue" />
        <StatCard title="Pass Rate" value={`${metrics?.passPercentage || 0}%`} subtitle={`${metrics?.passCount} Passed / ${metrics?.failCount} Failed`} icon={Award} color="green" />
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graph 1: Students by Course */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">Students Enrolled by Course</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.studentsByCourse || []}>
                <XAxis dataKey="courseName" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Fee Collection Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Fee Collection Breakdown</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.feeCollection || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enrollments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Recent Enrollments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(recentActivity?.recentEnrollments || []).map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-800">{e.student?.name || 'N/A'}</td>
                    <td className="py-3 px-3 text-slate-600">{e.batch?.batchName || 'N/A'}</td>
                    <td className="py-3 px-3 text-slate-500 text-xs">{formatDate(e.enrollmentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Recent Fee Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Paid Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(recentActivity?.recentFees || []).map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-800">{f.student?.name || 'N/A'}</td>
                    <td className="py-3 px-3 text-emerald-600 font-bold">{formatCurrency(f.paidAmount)}</td>
                    <td className="py-3 px-3">
                      <Badge type={f.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
