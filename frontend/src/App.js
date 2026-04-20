import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, dashboardPathFor } from '@/lib/auth';
import { Toaster } from 'sonner';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AuthCallback from '@/pages/AuthCallback';
import CoreTeamDashboard from '@/pages/CoreTeamDashboard';
import FacultyDashboard from '@/pages/FacultyDashboard';
import MemberDashboard from '@/pages/MemberDashboard';
import '@/App.css';

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-white">
        <div className="font-mono text-xs tracking-widest opacity-70">LOADING · THE MOMENT CLUB</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={dashboardPathFor(user.role)} replace />;
  return children;
}

function Router() {
  const location = useLocation();
  // Handle Emergent OAuth callback synchronously
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard/core"
        element={<Protected role="core_team"><CoreTeamDashboard /></Protected>}
      />
      <Route
        path="/dashboard/faculty"
        element={<Protected role="faculty"><FacultyDashboard /></Protected>}
      />
      <Route
        path="/dashboard/member"
        element={<Protected role="member"><MemberDashboard /></Protected>}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="App grain">
      <AuthProvider>
        <BrowserRouter>
          <Router />
          <Toaster theme="dark" position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
