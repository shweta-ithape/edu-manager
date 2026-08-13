import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { BookOpen, CalendarDays, Percent, IndianRupee, Award, Mail, Phone, MapPin } from 'lucide-react';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading student portal..." />;
  if (error) return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">{error}</div>;

  const { studentInfo, enrollments, attendance, feeRecords, results } = data || {};
  const currentEnrollment = enrollments && enrollments[0];
  const feeStatus = feeRecords && feeRecords[0];
  const latestResult = results && results[0];

  return (
    <div className="space-y-8">
      {/* Student Profile Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center justify-center font-bold text-2xl shadow-inner">
            {studentInfo?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold">{studentInfo?.name}</h1>
              <Badge type={studentInfo?.status} />
            </div>
            <p className="text-xs text-slate-300 mt-1 font-mono">Student ID: {studentInfo?.studentId}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> {studentInfo?.email}</span>
              <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" /> {studentInfo?.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Attendance Rate" value={`${attendance?.attendancePercentage || 0}%`} subtitle={`${attendance?.presentClasses || 0}/${attendance?.totalClasses || 0} Sessions`} icon={Percent} color="teal" />
        <StatCard title="Total Fee" value={formatCurrency(feeStatus?.totalFees || 0)} icon={IndianRupee} color="blue" />
        <StatCard title="Paid Amount" value={formatCurrency(feeStatus?.paidAmount || 0)} icon={IndianRupee} color="green" />
        <StatCard title="Pending Amount" value={formatCurrency(feeStatus?.pendingAmount || 0)} icon={IndianRupee} color="rose" />
      </div>

      {/* Course & Batch Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center">
            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
            Enrolled Course & Batch Details
          </h3>
          {!currentEnrollment ? (
            <p className="text-sm text-slate-500 py-4">No active batch enrollments found.</p>
          ) : (
            <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold text-blue-600 bg-blue-100/60 px-2.5 py-1 rounded-md">
                  {currentEnrollment.batch?.course?.courseName}
                </span>
                <Badge type={currentEnrollment.status} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">{currentEnrollment.batch?.batchName}</h4>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div>
                  <p className="text-slate-400 font-medium">Batch Schedule</p>
                  <p className="font-semibold text-slate-800">{currentEnrollment.batch?.timing}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Assigned Trainer</p>
                  <p className="font-semibold text-slate-800">{currentEnrollment.batch?.trainer?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Start Date</p>
                  <p className="font-semibold text-slate-800">{formatDate(currentEnrollment.batch?.startDate)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">End Date</p>
                  <p className="font-semibold text-slate-800">{formatDate(currentEnrollment.batch?.endDate)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Academic Marks & Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center">
            <Award className="w-5 h-5 text-amber-500 mr-2" />
            Latest Result & Marksheet
          </h3>
          {!latestResult ? (
            <p className="text-sm text-slate-500 py-4">No results uploaded yet.</p>
          ) : (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{latestResult.batch?.batchName}</h4>
                  <p className="text-xs text-slate-500">{latestResult.batch?.course?.courseName}</p>
                </div>
                <Badge type={latestResult.resultStatus} />
              </div>

              <div className="space-y-2 py-2 border-y border-slate-200">
                {latestResult.subjectMarks?.map((sub, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{sub.subject}</span>
                    <span className="font-bold text-slate-900">{sub.marksObtained} / {sub.maxMarks}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm pt-1">
                <span className="font-semibold text-slate-700">Percentage: <span className="font-extrabold text-blue-600">{latestResult.percentage}%</span></span>
                <span className="text-xs text-slate-500 font-italic">"{latestResult.remarks || 'Keep up the effort!'}"</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
