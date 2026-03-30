import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const StreakCalendar = () => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', user.id)
        .maybeSingle();

      setStreak(data?.streak || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ THIS return is CRITICAL
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">🔥 Daily Streak</h3>

      {loading ? (
        <p className="text-gray-400 italic">Loading streak...</p>
      ) : (
        <div className="flex items-center justify-between">
          
          <div>
            <p className="text-4xl font-black text-orange-500">
              {streak} 🔥
            </p>
            <p className="text-sm text-gray-500">
              Days in a row
            </p>
          </div>

          <div className="flex gap-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg ${
                  i < (streak % 7)
                    ? "bg-orange-400"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default StreakCalendar;
