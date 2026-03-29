import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, roll_number: rollNumber } }
      });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) alert(result.error.message);
    else if (isSignUp) alert("Success! Check your email to verify your account.");
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) alert(error.message);
    else alert("Password reset link sent to your email!");
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50 p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-indigo-100">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-indigo-600">StudyBrain AI</h1>
            <p className="text-gray-500 mt-2 font-medium">
              {isForgotPassword ? "Reset your password" : isSignUp ? "Create account" : "Welcome back"}
            </p>
        </div>

        {!isForgotPassword ? (
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <input type="text" placeholder="Full Name" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <input type="text" placeholder="Roll Number" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
              </>
            )}
            <input type="email" placeholder="Email" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
            
            <button disabled={loading} className="w-full bg-indigo-600 text-white font-black p-4 rounded-2xl hover:bg-indigo-700 transition-all">
              {loading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
            </button>
            
            {!isSignUp && (
              <p onClick={() => setIsForgotPassword(true)} className="text-center text-xs text-indigo-600 font-bold cursor-pointer hover:underline">Forgot Password?</p>
            )}
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input type="email" placeholder="Enter your email" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button disabled={loading} className="w-full bg-indigo-600 text-white font-black p-4 rounded-2xl underline-none">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p onClick={() => setIsForgotPassword(false)} className="text-center text-xs text-gray-500 font-bold cursor-pointer underline-none">Back to Login</p>
          </form>
        )}

        <button onClick={() => { setIsSignUp(!isSignUp); setIsForgotPassword(false); }} className="w-full mt-6 text-sm text-gray-500 font-bold">
          {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default Auth;