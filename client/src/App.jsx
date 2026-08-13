import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentsPage from './pages/StudentsPage';
import TrainersPage from './pages/TrainersPage';
import CoursesPage from './pages/CoursesPage';
import BatchesPage from './pages/BatchesPage';
import EnrollmentsPage from './pages/EnrollmentsPage';
import AttendancePage from './pages/AttendancePage';
import FeesPage from './pages/FeesPage';
import ResultsPage from './pages/ResultsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (user?.role === 'TRAINER') return <Navigate to="/dashboard/trainer" replace />;
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard/student" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Routes Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Role Dashboards */}
              <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route index element={<AdminDashboard />} />
              </Route>

              <Route path="/dashboard/trainer" element={<ProtectedRoute allowedRoles={['TRAINER']} />}>
                <Route index element={<TrainerDashboard />} />
              </Route>

              <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route index element={<StudentDashboard />} />
              </Route>

              {/* Modules */}
              <Route path="/students" element={<ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']} />}>
                <Route index element={<StudentsPage />} />
              </Route>

              <Route path="/trainers" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route index element={<TrainersPage />} />
              </Route>

              <Route path="/courses" element={<ProtectedRoute allowedRoles={['ADMIN', 'TRAINER', 'STUDENT']} />}>
                <Route index element={<CoursesPage />} />
              </Route>

              <Route path="/batches" element={<ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']} />}>
                <Route index element={<BatchesPage />} />
              </Route>

              <Route path="/enrollments" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route index element={<EnrollmentsPage />} />
              </Route>

              <Route path="/attendance" element={<ProtectedRoute allowedRoles={['ADMIN', 'TRAINER', 'STUDENT']} />}>
                <Route index element={<AttendancePage />} />
              </Route>

              <Route path="/fees" element={<ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']} />}>
                <Route index element={<FeesPage />} />
              </Route>

              <Route path="/results" element={<ProtectedRoute allowedRoles={['ADMIN', 'TRAINER', 'STUDENT']} />}>
                <Route index element={<ResultsPage />} />
              </Route>

              <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']} />}>
                <Route index element={<ReportsPage />} />
              </Route>

              <Route path="/profile" element={<ProtectedRoute allowedRoles={['ADMIN', 'TRAINER', 'STUDENT']} />}>
                <Route index element={<ProfilePage />} />
              </Route>

              {/* 404 Route inside layout */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
