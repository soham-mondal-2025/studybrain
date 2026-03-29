import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const Sidebar = ({ onNavigate, activePage, onLogout }) => {
  const [userEmail, setUserEmail] = useState('');

  // Fetch the logged-in user's email
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    getUserData();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: '🏠' },
    { id: 'ai-tutor', label: 'AI Tutor', icon: '🤖' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'social', label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col p-6 no-print">
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
          S
        </div>
        <span className="text-xl font-black text-gray-800 tracking-tight">StudyBrain</span>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${
              activePage === item.id
                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* BOTTOM SECTION: USER INFO & LOGOUT */}
      <div className="pt-6 border-t border-gray-100 space-y-4">
        {/* USER IDENTITY CARD */}
        <div className="flex items-center gap-3 px-2 py-3 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm">
            👤
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Logged In As</p>
            <p className="text-xs font-bold text-gray-700 truncate">{userEmail || 'Loading...'}</p>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <span className="text-xl">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;