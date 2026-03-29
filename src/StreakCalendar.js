import React from 'react';
import StreakCalendar from './StreakCalendar';

const Overview = () => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Welcome back, Soham! 👋</h1>
          <p className="text-gray-500 font-medium">Roll Number: 41 | Let's crush your goals today.</p>
        </div>
        <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200">
          <p className="text-xs uppercase tracking-widest font-bold opacity-80">Current Status</p>
          <p className="text-lg font-bold">Active Scholar 🎓</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activity */}
        <div className="lg:col-span-2 space-y-8">
          <StreakCalendar />
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">Quick Tip from StudyBuddy AI 🤖</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              "Soham, your evening sessions are 20% more productive than mornings. 
              Try tackling your hardest Physics problems between 7 PM and 9 PM!"
            </p>
          </div>
        </div>

        {/* Right Column: Stats Cards */}
        <div className="space-y-6">
          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
            <p className="text-orange-600 font-bold text-sm uppercase">Focus Minutes</p>
            <p className="text-3xl font-black text-orange-900">1,240</p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <p className="text-blue-600 font-bold text-sm uppercase">Tests Completed</p>
            <p className="text-3xl font-black text-blue-900">12</p>
          </div>

          <div className="bg-indigo-900 text-white p-6 rounded-3xl">
            <p className="text-indigo-300 font-bold text-sm uppercase">Global Rank</p>
            <p className="text-3xl font-black">#4</p>
            <p className="text-xs mt-2 opacity-70">Top 5% of users this week!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;