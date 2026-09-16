import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { UserAccount, PortalTheme } from '../types';
import { TherapyHubLogo } from './TherapyHubLogo';

interface LoginScreenProps {
  users: Record<string, UserAccount>;
  onLoginSuccess: (user: UserAccount) => void;
  theme?: PortalTheme;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess, theme }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const normalizedUser = username.trim().toLowerCase();
      const user = users[normalizedUser];

      if (user && user.pass === password.trim()) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('Invalid Username or Password. Please contact the administrator if you forgot your credentials.');
      }
      setIsLoading(false);
    }, 200);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#060913] via-[#091122] to-[#040817] no-print selection:bg-cyan-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Light Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header with Official Logo */}
          <div className="text-center mb-6 relative">
            <div className="flex justify-center mb-4">
              <div className="p-2.5 rounded-2xl bg-white shadow-xl shadow-cyan-950/50 border border-slate-200">
                <img
                  src="/therapy-hub-logo.jpg"
                  alt="Therapy Hub - All Therapies Under One Roof"
                  referrerPolicy="no-referrer"
                  className="h-16 w-auto object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Therapy Hub Portal</h1>
            <p className="text-slate-400 text-xs mt-1 font-medium">Clinical Management & Staff Attendance Portal</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-950/80 border border-slate-700/60 text-[11px] text-slate-300 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              PECHS Main Medical Campus • Secure GPS Enabled
            </div>
          </div>

          {/* Quick Fill Demo Badges */}
          <div className="mb-5 p-2.5 rounded-2xl bg-black/30 border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Quick Fill Login Demo:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition-all cursor-pointer"
              >
                Admin (Zohaib Ali)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('shawana', 'staff123')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 transition-all cursor-pointer"
              >
                Staff (Ms Shawana)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sidra', 'staff123')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 transition-all cursor-pointer"
              >
                Staff (Ms Sidra)
              </button>
            </div>
          </div>

          {/* Secure Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username / Staff ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. admin, shawana)"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-center font-semibold">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:from-cyan-700 active:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-950/60 hover:shadow-cyan-900/80 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-7 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Authorized clinic personnel only.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
