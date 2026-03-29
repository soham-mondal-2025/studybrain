import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'framer-motion'; 
import 'katex/dist/katex.min.css';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const AITutor = () => {
  const [mode, setMode] = useState('chat');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [totalMarks, setTotalMarks] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [difficulty, setDifficulty] = useState('medium');
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [quiz, setQuiz] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]); 
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (quiz.length > 0 && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz.length > 0 && !showResult) {
      handleAnswer(-1); 
    }
  }, [timeLeft, quiz, showResult]);

  // FIX: Aggressive cleaning to prevent PDF "&&&&" encoding issues
  const cleanMathText = (text) => {
    if (!text) return "";
    return text
      .replace(/\$/g, '') 
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)') 
      .replace(/\\pi/g, 'pi') 
      .replace(/\\int_([^{]+)\^([^{]+)/g, 'Integral from $1 to $2') 
      .replace(/\\infty/g, 'infinity')
      .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
      .replace(/\\ln/g, 'ln')
      .replace(/\\e\^/g, 'e^')
      .replace(/\\cdot/g, '*')
      .replace(/\{|}/g, '')
      .replace(/[^\x00-\x7F]/g, ""); // Final safety: Remove non-ASCII
  };

  const suggestTime = async () => {
    if (!topic.trim()) return alert("Please enter a topic first!");
    setIsSuggesting(true);
    try {
      const prompt = `Analyze topic: "${topic}", Difficulty: ${difficulty}, Qs: ${numQuestions}, Total Marks: ${totalMarks}. Based on complexity, return ONLY the ideal seconds per question as an integer.`;
      const result = await model.generateContent(prompt);
      const suggestedSeconds = parseInt(result.response.text().trim());
      if (!isNaN(suggestedSeconds)) setTimeLimit(suggestedSeconds);
    } catch (err) { console.error(err); } 
    finally { setIsSuggesting(false); }
  };

  const generateQuiz = async () => {
    if (!topic.trim()) return alert("Enter a topic!");
    setLoading(true);
    try {
      const prompt = `Generate ${numQuestions} MCQ for ${topic} (${difficulty}). Each question is worth ${totalMarks/numQuestions} marks. Return JSON array only with keys: question, options (array), correct (index 0-3). Ensure questions use clean LaTeX.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, "");
      const parsedQuiz = JSON.parse(text);
      setQuiz(parsedQuiz);
      setUserAnswers([]);
      setScore(0);
      setCurrentIdx(0);
      setMode('quiz');
      setTimeLeft(timeLimit);
    } catch (err) { alert("Generation failed!"); }
    finally { setLoading(false); }
  };

  const handleAnswer = (idx) => {
    const correctIdx = quiz[currentIdx].correct;
    const isCorrect = idx === correctIdx;
    
    setUserAnswers(prev => [...prev, { 
      question: quiz[currentIdx].question, 
      selected: idx === -1 ? "Timed Out" : quiz[currentIdx].options[idx],
      correct: quiz[currentIdx].options[correctIdx],
      status: isCorrect 
    }]);

    if (isCorrect) setScore(prev => prev + 1);
    
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(timeLimit);
    } else {
      setShowResult(true);
    }
  };

  // FIX: Updated exportPDF to handle fonts and page breaks correctly
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(79, 70, 229); 
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Quiz Performance Report", 20, 25);
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Topic: ${topic}`, 20, 50);
    doc.text(`Final Score: ${score} / ${quiz.length}`, 20, 58);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 66);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 72, pageWidth - 20, 72);
    
    let yPos = 85;
    
    userAnswers.forEach((ans, i) => {
      if (yPos > 260) { 
        doc.addPage(); 
        yPos = 20; 
      }
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`Question ${i + 1}`, 20, yPos);
      
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "normal");
      const cleanQ = cleanMathText(ans.question);
      const splitQ = doc.splitTextToSize(cleanQ, pageWidth - 40);
      doc.text(splitQ, 20, yPos + 7);
      
      yPos += (splitQ.length * 7) + 5;

      doc.setFontSize(10);
      if (ans.status) {
        doc.setTextColor(16, 185, 129);
        doc.text(`Your Answer: ${cleanMathText(ans.selected)} (Correct)`, 25, yPos);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text(`Your Answer: ${cleanMathText(ans.selected)} (Incorrect)`, 25, yPos);
        yPos += 6;
        doc.setTextColor(71, 85, 105);
        doc.text(`Correct Answer: ${cleanMathText(ans.correct)}`, 25, yPos);
      }
      yPos += 15; 
    });
    
    doc.save(`${topic.replace(/\s+/g, '_')}_Results.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden pb-20">
      <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity }} className="fixed -top-20 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity }} className="fixed -bottom-20 -right-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl mb-12 w-fit border border-white mx-auto mt-8">
          {['chat', 'quiz'].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`relative px-10 py-3 rounded-xl font-black transition-all z-10 ${mode === m ? 'text-white' : 'text-gray-400'}`}>
              {mode === m && <motion.div layoutId="activeTab" className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-200" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              {m === 'chat' ? 'Explain Mode' : 'Quiz Mode'}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'quiz' ? (
            <motion.div key="quiz-section" variants={staggerContainer} initial="initial" animate="animate" exit={{ opacity: 0, x: -20 }} className="space-y-8">
              {!quiz.length ? (
                <motion.div variants={fadeInUp} className="bg-white p-10 rounded-[40px] border shadow-2xl space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-sm font-black text-indigo-400 uppercase tracking-widest block">Topic</label>
                      <input className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all text-lg font-medium" placeholder="Ex: Calculus" onChange={(e) => setTopic(e.target.value)} />
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-black text-indigo-400 uppercase tracking-widest block">Total Marks</label>
                      <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all text-lg font-medium" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-sm font-black text-indigo-400 uppercase tracking-widest block">Duration (Sec/Q)</label>
                      <div className="flex gap-2">
                        <input type="number" className="flex-1 p-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all text-lg font-medium" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
                        <button onClick={suggestTime} className="bg-indigo-50 text-indigo-600 px-4 rounded-2xl font-black text-sm">{isSuggesting ? "..." : "🪄 Suggest"}</button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-black text-indigo-400 uppercase tracking-widest block">No. of Questions</label>
                      <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all text-lg font-medium" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} />
                    </div>
                  </div>

                  <motion.div variants={fadeInUp} className="space-y-4">
                    <label className="text-sm font-black text-indigo-400 uppercase tracking-widest block">Mastery Level</label>
                    <div className="grid grid-cols-4 gap-4">
                      {['easy', 'medium', 'hard', 'mixed'].map((lvl) => (
                        <button key={lvl} onClick={() => setDifficulty(lvl)} className={`py-4 rounded-2xl font-black capitalize border-4 transition-all ${difficulty === lvl ? 'bg-indigo-600 border-indigo-200 text-white shadow-xl' : 'bg-white border-slate-50 text-slate-400'}`}>{lvl}</button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.button variants={fadeInUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateQuiz} className="w-full bg-indigo-600 text-white p-6 rounded-3xl font-black text-2xl shadow-2xl shadow-indigo-200">
                    {loading ? "Constructing Universe..." : "🚀 Launch Challenge"}
                  </motion.button>
                </motion.div>
              ) : !showResult ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[50px] shadow-2xl border border-slate-100 relative">
                  <div className="absolute top-0 left-0 w-full h-3 bg-slate-100 rounded-t-[50px] overflow-hidden">
                    <motion.div className="h-full bg-indigo-500" initial={{ width: "100%" }} animate={{ width: `${(timeLeft/timeLimit)*100}%` }} transition={{ duration: 1, ease: "linear" }} />
                  </div>
                  <div className="flex justify-between items-center mb-10 mt-4">
                    <span className="bg-slate-100 px-5 py-2 rounded-full font-black text-slate-500 uppercase text-xs">Question {currentIdx + 1} / {quiz.length}</span>
                    <span className={`text-2xl font-black ${timeLeft < 10 ? 'text-red-500' : 'text-slate-800'}`}>{timeLeft}s</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-12 leading-snug">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{quiz[currentIdx].question}</ReactMarkdown>
                  </div>
                  <div className="grid gap-5">
                    {quiz[currentIdx].options.map((opt, i) => (
                      <motion.button key={i} whileHover={{ x: 10, backgroundColor: "#f8fafc" }} onClick={() => handleAnswer(i)} className="group w-full text-left p-6 rounded-[30px] border-2 border-slate-50 flex items-center gap-6 shadow-sm hover:border-indigo-500 transition-all">
                        <span className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">{String.fromCharCode(65 + i)}</span>
                        <span className="text-xl font-bold text-slate-700"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt}</ReactMarkdown></span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-20 rounded-[60px] shadow-2xl">
                  <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-8xl mb-8">🏆</motion.div>
                  <h2 className="text-5xl font-black text-slate-900 mb-4">Mission Complete</h2>
                  <div className="text-7xl font-black text-indigo-600 my-10 tracking-tighter">
                    {score} <span className="text-3xl text-slate-200">/ {quiz.length}</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => {setQuiz([]); setShowResult(false);}} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl">Try Again</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={exportPDF} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl">📄 Export PDF</motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="chat-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white/50 backdrop-blur-sm p-32 rounded-[60px] border-4 border-dashed border-slate-200 text-center">
               <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }}><div className="text-6xl mb-6">🤖</div></motion.div>
               <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Awaiting Command</h3>
               <p className="text-slate-400 mt-2 font-bold">Switch to Quiz Mode to test your knowledge</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AITutor;