import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import DashboardShell from './DashboardShell';
import Overview from './Overview';
import TaskManager from './TaskManager';
import Analytics from './Analytics';
import Auth from './Auth';
import AITutor from './AITutor';
import ChatScanner from './ChatScanner';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes on auth state (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* If no session, any path redirects to /auth. If session exists, /auth redirects to dashboard */}
        <Route 
          path="/auth" 
          element={!session ? <Auth /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/" 
          element={session ? <DashboardShell /> : <Navigate to="/auth" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Overview />} />
          <Route path="tasks" element={<TaskManager />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-tutor" element={<AITutor />} />
        </Route>

        {/* Fallback for any undefined routes */}
        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/auth"} replace />} />
      </Routes>

      {/* Floating AI Bot available throughout the app */}
      <ChatScanner />
    </Router>
  );
}

export default App;
