import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ strength: '...', weakness: '...', avg: 0, totalTests: 0 });
  const [chartData, setChartData] = useState([]);
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserName(user.user_metadata?.full_name || 'Student');

      // 1. Fetch all test results for this user
      const { data: tests, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (tests && tests.length > 0) {
        // 2. Calculate Strength & Weakness
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

        // 3. Prepare Chart Data (Last 7 tests)
        const formattedChart = tests.slice(-7).map(t => ({
          name: t.topic.substring(0, 5), // Shorten name for X-axis
          score: Math.round((t.score / t.total_marks) * 100)
        }));

        setStats({
          strength: bestTopic,
          weakness: worstTopic,
          avg: Math.round(totalSum / Object.keys(topicMap).length),
          totalTests: tests.length
        });
        setChartData(formattedChart);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Overview</h1>

      {/* Top Banner */}
      <div className="bg-indigo-600 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">Welcome back, {userName}! 👋</h2>
          <p className="opacity-80">Roll No: 41 | Your average is {stats.avg}%</p>
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
        <h3 className="text-lg font-bold mb-6">Performance Graph (Last 7 Tests)</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 italic">
              Complete your first test to see your progress graph!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;