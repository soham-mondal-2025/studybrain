import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analytics = () => {
  const [pieData, setPieData] = useState(null);
  const [barData, setBarData] = useState(null);
  const [strength, setStrength] = useState("-");
  const [weakness, setWeakness] = useState("-");
  const [tasksDone, setTasksDone] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ SUBJECT DETECTION LOGIC
  const getSubject = (topic = "") => {
    const t = topic.toLowerCase();

    if (t.includes("algebra") || t.includes("calculus") || t.includes("geometry") || t.includes("math"))
      return "Mathematics";

    if (t.includes("physics") || t.includes("motion") || t.includes("force") || t.includes("energy"))
      return "Physics";

    if (t.includes("chemistry") || t.includes("reaction") || t.includes("organic"))
      return "Chemistry";

    if (t.includes("code") || t.includes("program") || t.includes("computer") || t.includes("algorithm"))
      return "Computer Science";

    if (t.includes("english") || t.includes("grammar"))
      return "English";

    return "Other";
  };

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tests = [] } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id);

      const { data: tasks = [] } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      // =========================
      // ✅ PIE CHART (SUBJECTS)
      // =========================
      const subjectMap = {};

      tests.forEach(t => {
        const subject = getSubject(t.topic);
        subjectMap[subject] = (subjectMap[subject] || 0) + 1;
      });

      if (Object.keys(subjectMap).length === 0) {
        // Default empty state
        setPieData({
          labels: ["No Data"],
          datasets: [{
            data: [1],
            backgroundColor: ["#e5e7eb"]
          }]
        });
      } else {
        setPieData({
          labels: Object.keys(subjectMap),
          datasets: [{
            data: Object.values(subjectMap),
            backgroundColor: [
              "#4f46e5",
              "#22c55e",
              "#f59e0b",
              "#ef4444",
              "#3b82f6",
              "#a855f7"
            ]
          }]
        });
      }

      // =========================
      // ✅ BAR CHART (LAST 5 TESTS)
      // =========================
      if (tests.length === 0) {
        setBarData({
          labels: ["T1", "T2", "T3"],
          datasets: [{
            label: "Score %",
            data: [0, 0, 0],
            backgroundColor: "#c7d2fe"
          }]
        });
      } else {
        const lastTests = tests.slice(-5);

        setBarData({
          labels: lastTests.map((_, i) => `T${i + 1}`),
          datasets: [{
            label: "Score %",
            data: lastTests.map(t =>
              Math.round((t.score / t.total_marks) * 100)
            ),
            backgroundColor: "#4f46e5"
          }]
        });
      }

      // =========================
      // ✅ STRENGTH & WEAKNESS (BY SUBJECT)
      // =========================
      const subjectScores = {};

      tests.forEach(t => {
        const subject = getSubject(t.topic);

        if (!subjectScores[subject]) {
          subjectScores[subject] = { total: 0, count: 0 };
        }

        subjectScores[subject].total += (t.score / t.total_marks) * 100;
        subjectScores[subject].count += 1;
      });

      let best = "-";
      let worst = "-";
      let max = -1;
      let min = 101;

      Object.keys(subjectScores).forEach(sub => {
        const avg = subjectScores[sub].total / subjectScores[sub].count;

        if (avg > max) {
          max = avg;
          best = sub;
        }

        if (avg < min) {
          min = avg;
          worst = sub;
        }
      });

      setStrength(best);
      setWeakness(worst);

      // =========================
      // ✅ TASK COMPLETION
      // =========================
      setTasksDone(tasks.filter(t => t.status === "Complete").length);

    } catch (err) {
      console.error("Analytics Error:", err);
    }
  };

  return (
    <div className="space-y-6">

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* PIE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="font-bold mb-4 text-center">📚 Subject Distribution</h3>
          <div className="h-64 flex justify-center items-center">
            {pieData && <Pie data={pieData} />}
          </div>
        </div>

        {/* BAR */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="font-bold mb-4 text-center">📊 Recent Performance</h3>
          <div className="h-64 flex justify-center items-center">
            {barData && <Bar data={barData} options={{ maintainAspectRatio: false }} />}
          </div>
        </div>

      </div>

      {/* STATS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border grid md:grid-cols-3 gap-4 text-center">

        <div className="p-4 bg-green-50 rounded-xl">
          <p className="font-bold text-green-600">💪 Strength</p>
          <p className="text-lg font-black text-green-800">{strength}</p>
        </div>

        <div className="p-4 bg-red-50 rounded-xl">
          <p className="font-bold text-red-600">⚠️ Weakness</p>
          <p className="text-lg font-black text-red-800">{weakness}</p>
        </div>

        <div className="p-4 bg-indigo-50 rounded-xl">
          <p className="font-bold text-indigo-600">✅ Tasks Completed</p>
          <p className="text-lg font-black text-indigo-800">{tasksDone}</p>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
