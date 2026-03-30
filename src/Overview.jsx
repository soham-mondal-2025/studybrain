import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StreakCalendar from './StreakCalendar'; // ✅ ADD THIS

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ strength: '...', weakness: '...', avg: 0, totalTests: 0 });
  const [chartData, setChartData] = useState([]);
  const [userName, setUserName] = useState('Student');
  const [xp, setXP] = useState(0); // ✅ NEW

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserName(user.user_metadata?.full_name || 'Student');

      // ✅ Fetch XP
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', user.id)
        .maybeSingle();

      setXP(profile?.xp || 0);

      // ✅ Fetch test results
      const { data: tests } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (tests && tests.length > 0) {
        const topicMap = {};
        tests.forEach(test => {
          if (!topicMap[test.topic]) topicMap[test.topic] = { total: 0, count: 0 };
          topicMap[test.topic].total += (test.score / test.total_marks) * 100;
          topicMap[test.topic].count += 1;
        });

        let bestTopic = "";
        let worstTopic = "";
        let maxAvg = -1;
        let minAvg = 101;
        let totalSum = 0;

        Object.keys(topicMap).forEach(topic => {
          const avg = topicMap[topic].total / topicMap[topic].count;
          totalSum += avg;
          if (avg > maxAvg) { maxAvg = avg; bestTopic = topic; }
          if (avg < minAvg) { minAvg = avg; worstTopic = topic; }
        });

        // ✅ Graph data (always valid)
        const formattedChart = tests.slice(-7).map((t, i) => ({
          name: `T${i + 1}`,
          score: Math.round((t.score / t.total_marks) * 100)
        }));

        setStats({
          strength: bestTopic,
          weakness: worstTopic,
          avg: Math.round(totalSum / Object.keys(topicMap).length),
          totalTests: tests.length
        });

        setChartData(formattedChart);
      } else {
        // ✅ Default empty graph (shows axes)
        setChartData([
          { name: "T1", score: 0 },
          { name: "T2", score: 0 },
          { name: "T3", score: 0 },
          { name: "T4", score: 0 },
          { name: "T5", score: 0 }
        ]);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Overview</h1>

      {/* 🔥 STREAK ADDED HERE */}
      <div className="mb-8">
        <StreakCalendar />
      </div>

      {/* Top Banner */}
      <div className="bg-indigo-600 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">Welcome back, {userName}! 👋</h2>
          <p className="opacity-80">Roll No: 41 | Total XP: {xp} 🚀</p>
          <button className="mt-4 bg-white text-indigo-600 px-6 py-2 rounded-full font-bold text-sm">View Profile</button>
        </div>
        <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white opacity-10 rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">TESTS TAKEN</p>
          <h3 className="text-4xl font-black text-indigo-600">{stats.totalTests}</h3>
        </div>

        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💪</span>
            <p className="text-green-700 font-bold">Strength</p>
          </div>
          <h3 className="text-2xl font-bold text-green-900">
            {loading ? "Analyzing..." : (stats.strength || "No Data")}
          </h3>
        </div>

        <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-700 font-bold">Weakness</p>
          </div>
          <h3 className="text-2xl font-bold text-red-900">
            {loading ? "Analyzing..." : (stats.weakness || "No Data")}
          </h3>
        </div>
      </div>

      {/* Performance Graph */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Performance Graph</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#4f46e5" 
                strokeWidth={3} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;
