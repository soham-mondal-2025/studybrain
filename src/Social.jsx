import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const Social = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('xp', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center">
            🏆 Global Study Leaderboard
          </h2>
          <button 
            onClick={fetchLeaderboard}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition"
          >
            Refresh 🔄
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-10 italic">Loading real-time rankings...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-10 italic">No students joined yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {users.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                <div className="flex items-center space-x-4">
                  <span className={`font-black text-lg w-6 ${index === 0 ? 'text-yellow-500' : 'text-gray-300'}`}>
                    #{index + 1}
                  </span>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 border-2 border-white shadow-sm">
                    {user.full_name ? user.full_name.substring(0, 2).toUpperCase() : '??'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{user.full_name || "New Student"}</p>
                    <p className="text-xs text-gray-500 italic">Level 1 Scholar</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600 text-lg">{user.xp || 0} XP</p>
                  <p className="text-xs text-orange-500 font-bold">{user.streak || 0} Day Streak 🔥</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bold mb-2">Privacy Note 🔒</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Your friends can only see your <strong>Rank, Streak, and Average Score</strong>. 
            Your uploaded PDFs and personal notes in "Tasks & Deadlines" remain 100% private to you.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500 rounded-full opacity-20"></div>
      </div>
    </div>
  );
};

export default Social;
