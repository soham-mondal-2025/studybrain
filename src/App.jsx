import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import Overview from './Overview';
import TaskManager from './TaskManager';
import Analytics from './Analytics';
import Auth from './Auth';
// import QuizAI from './QuizAI'; <--- REMOVE OR DELETE THIS LINE
import ChatScanner from './ChatScanner';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<DashboardShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Overview />} />
          <Route path="tasks" element={<TaskManager />} />
          <Route path="analytics" element={<Analytics />} />
          {/* We don't need the /quiz route anymore because it's inside AI Tutor */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>

      {/* The Floating AI Bot */}
      <ChatScanner />
    </Router>
  );
}

export default App;