import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, ShieldCheck, AlertCircle, Eye, EyeOff, CheckCircle2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  theme: 'dark' | 'light';
}

export const AdminLoginModal = ({ isOpen, onClose, onLogin, theme }: AdminLoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ADMIN_EMAIL = 'homejeprojects@gmail.com';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // The rules check for specific emails, so we just need to be authenticated
      // and have the correct email in the token.
      if (result.user.email === 'rafiautomotive3@gmail.com' || result.user.email === ADMIN_EMAIL) {
        onLogin();
        onClose();
      } else {
        await signOut(auth);
        setError('Unauthorized email address.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedPassword = localStorage.getItem('homi_j_admin_password');
    if (!savedPassword) {
      setIsSettingPassword(true);
    } else {
      setIsSettingPassword(false);
    }
  }, [isOpen]);

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    localStorage.setItem('homi_j_admin_password', newPassword);
    setIsSettingPassword(false);
    setError('');
    alert('Admin password set successfully! Please login now.');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPassword = localStorage.getItem('homi_j_admin_password');
    
    if (email !== ADMIN_EMAIL) {
      setError('Invalid admin email.');
      return;
    }
    
    if (password === savedPassword) {
      onLogin();
      onClose();
      setEmail('');
      setPassword('');
      setError('');
    } else {
      setError('Invalid password.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border transition-colors duration-500 ${
              theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-electric-blue rounded-xl flex items-center justify-center shadow-lg shadow-electric-blue/20">
                    <ShieldCheck className="text-white w-6 h-6" />
                  </div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {isSettingPassword ? 'Set Admin Password' : 'Admin Login'}
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isSettingPassword ? (
                <form onSubmit={handleSetPassword} className="space-y-6">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Welcome, Admin. Please set a secure password for <span className="text-electric-blue font-bold">{ADMIN_EMAIL}</span>.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-4 rounded-xl border transition-all focus:ring-2 focus:ring-electric-blue/20 outline-none ${
                          theme === 'dark' 
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-electric-blue/50' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-electric-blue'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-electric-blue"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 py-4 rounded-xl border transition-all focus:ring-2 focus:ring-electric-blue/20 outline-none ${
                          theme === 'dark' 
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-electric-blue/50' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-electric-blue'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white font-bold py-6 rounded-xl text-lg shadow-lg shadow-electric-blue/20">
                    Set Password
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <Button 
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white font-bold py-8 rounded-2xl text-xl shadow-xl shadow-electric-blue/20 flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg className="w-8 h-8" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {isLoading ? 'Connecting...' : 'Login with Google'}
                    </Button>
                    <p className={`text-center text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Required for database access & cloud synchronization
                    </p>
                  </div>

                  <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                      <div className={`w-full border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className={`px-4 font-bold tracking-widest ${theme === 'dark' ? 'bg-[#0a0a0a] text-gray-600' : 'bg-white text-gray-400'}`}>Or use local password</span>
                    </div>
                  </div>

                  <div className="space-y-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={ADMIN_EMAIL}
                          className={`w-full pl-10 py-4 rounded-xl border transition-all focus:ring-2 focus:ring-electric-blue/20 outline-none ${
                            theme === 'dark' 
                              ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-electric-blue/50' 
                              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-electric-blue'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500 ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-10 py-4 rounded-xl border transition-all focus:ring-2 focus:ring-electric-blue/20 outline-none ${
                            theme === 'dark' 
                              ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-electric-blue/50' 
                              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-electric-blue'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-electric-blue"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="ghost"
                      className={`w-full py-4 rounded-xl font-bold transition-all ${
                        theme === 'dark' ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Login with Password (Local Only)
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
