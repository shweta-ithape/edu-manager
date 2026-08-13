import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import { formatDate } from '../utils/formatters';
import { CalendarDays, Users, CheckCircle2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrainerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrainerDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load trainer dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading trainer portal..." />;
  if (error) return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">{error}</div>;

  const { trainerInfo, assignedBatches, totalBatches, totalStudentsCount, todayAttendanceCount, todayPresentCount, recentResults } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-blue-300">Trainer Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Welcome back, {trainerInfo?.name}!</h1>
          <p className="text-sm text-blue-200 mt-1">Specialization: {trainerInfo?.specialization} | ID: {trainerInfo?.trainerId}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to="/attendance"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Attendance</span>
          </Link>
          <Link
            to="/results"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm backdrop-blur-md transition-all flex items-center space-x-2"
          >
            <Award className="w-4 h-4" />
            <span>Enter Marks</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Assigned Batches" value={totalBatches || 0} icon={CalendarDays} color="purple" />
        <StatCard title="Total Students" value={totalStudentsCount || 0} icon={Users} color="blue" />
        <StatCard title="Today's Marked Attendance" value={`${todayAttendanceCount || 0} Records`} icon={CheckCircle2} color="green" />
        <StatCard title="Present Today" value={todayPresentCount || 0} icon={CheckCircle2} color="teal" />
      </div>

      {/* Assigned Batches Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">My Assigned Batches</h3>
        {(!assignedBatches || assignedBatches.length === 0) ? (
          <p className="text-sm text-slate-500 py-4">No active batches currently assigned to you.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assignedBatches.map((batch) => (
              <div key={batch._id} className="p-5 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{batch.course?.courseName}</span>
                    <Badge type={batch.status} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base mt-2">{batch.batchName}</h4>
                  <p className="text-xs text-slate-500 mt-1">Schedule: {batch.timing}</p>
                  <p className="text-xs text-slate-400 mt-1">Duration: {formatDate(batch.startDate)} - {formatDate(batch.endDate)}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Capacity: {batch.capacity} Students</span>
                  <Link to="/attendance" className="text-blue-600 hover:underline font-semibold">Attendance &rarr;</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Student Marks */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">Recent Student Results Entered</h3>
          <Link to="/results" className="text-xs font-bold text-blue-600 hover:underline">View All &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Batch</th>
                <th className="py-2.5 px-3">Total Marks</th>
                <th className="py-2.5 px-3">Percentage</th>
                <th className="py-2.5 px-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!recentResults || recentResults.length === 0) ? (
                <tr><td colSpan="5" className="py-4 text-center text-slate-400">No recent result records found.</td></tr>
              ) : (
                recentResults.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-800">{r.student?.name || 'N/A'}</td>
                    <td className="py-3 px-3 text-slate-600">{r.batch?.batchName || 'N/A'}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{r.totalMarks}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{r.percentage}%</td>
                    <td className="py-3 px-3"><Badge type={r.resultStatus} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
