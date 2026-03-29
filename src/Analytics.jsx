import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Registering Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
  // Data for the Subject Distribution Pie Chart
  const pieData = {
    labels: ['Math', 'Physics', 'Computer Science', 'English'],
    datasets: [
      {
        label: 'Study Hours',
        data: [12, 19, 15, 8],
        backgroundColor: ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff'],
        borderWidth: 1,
      },
    ],
  };

  // Data for Friend Comparison Bar Chart
  const barData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Soham (You)',
        data: [75, 82, 88, 91],
        backgroundColor: '#4f46e5',
      },
      {
        label: 'Friend (Avg)',
        data: [70, 78, 80, 85],
        backgroundColor: '#94a3b8',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-center">Subject Distribution</h3>
          <div className="h-64 flex justify-center">
            <Pie data={pieData} />
          </div>
        </div>

        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-center">Score Comparison (vs Friends)</h3>
          <div className="h-64 flex justify-center">
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

      </div>

      {/* DETAILED SWOT TABLE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Detailed SWOT Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="font-bold text-green-700">STRENGTHS</p>
            <ul className="text-xs text-green-600 mt-2 list-disc ml-4">
              <li>Consistent Daily Streak</li>
              <li>High Accuracy in Math</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="font-bold text-red-700">WEAKNESSES</p>
            <ul className="text-xs text-red-600 mt-2 list-disc ml-4">
              <li>Physics Lab Reports</li>
              <li>Late Night Productivity</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="font-bold text-blue-700">OPPORTUNITIES</p>
            <ul className="text-xs text-blue-600 mt-2 list-disc ml-4">
              <li>AI Peer Mock Tests</li>
              <li>Morning Study Slots</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="font-bold text-yellow-700">THREATS</p>
            <ul className="text-xs text-yellow-600 mt-2 list-disc ml-4">
              <li>Upcoming Semester Finals</li>
              <li>Social Media Distraction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;