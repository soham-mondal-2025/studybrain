import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added for smooth transitions
import Sidebar from './Sidebar';
import ChatScanner from './ChatScanner';
import { supabase } from './supabaseClient';
import Social from './Social';
import Analytics from './Analytics';
import TaskManager from './TaskManager';
import AITutor from './AITutor';
import Overview from './Overview';

// Animation Variants
const pageTransition = {
  initial: { opacity: 0, y: 20, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, filter: "blur(10px)" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerItems = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const DashboardShell = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar 
        onNavigate={setActiveTab} 
        activePage={activeTab} 
        onLogout={handleLogout} 
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto relative bg-[#F8F9FE]">
        
        {/* Animated Header */}
        <motion.header 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 capitalize tracking-tight">
            {activeTab.replace('-', ' ')}
          </h1>
          
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
          >
            🔔
          </motion.button>
        </motion.header>

        {/* PAGE CONTENT WITH ANIMATE PRESENCE */}
        <motion.div 
          variants={staggerItems}
          initial="initial"
          animate="animate"
          className="max-w-6xl mx-auto pb-20"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab} // Forces re-animation when tab changes
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {activeTab === 'overview' && <Overview />}
              {activeTab === 'ai-tutor' && <AITutor />}
              {activeTab === 'tasks' && <TaskManager />}
              {activeTab === 'analytics' && <Analytics />}
              {activeTab === 'social' && <Social />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        {/* Floating AI Bot - Animated independently */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        >
          <ChatScanner />
        </motion.div>

        {/* Optional: Subtle Background Path Animation (Inspired by your code) */}
        <svg className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-0">
          <motion.path
            d="M0 100 Q 250 50 500 100 T 1000 100"
            fill="none"
            stroke="#4F46E5"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
          />
        </svg>
      </main>
    </div>
  );
};

export default DashboardShell;
