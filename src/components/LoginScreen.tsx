import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount } from '../types';
import { INITIAL_USERS } from '../data/initialUsers';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LoginScreenProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users: propUsers, onLoginSuccess }) => {
  const [cloudUsers, setCloudUsers] = useState<UserAccount[]>([]);

  // Listen to cloud Firestore users in real-time so any newly registered account can login from any device instantly
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: UserAccount[] = [];
            snapshot.forEach((doc) => {
              list.push(doc.data() as UserAccount);
            });
            setCloudUsers(list);
          }
        },
        (err) => {
          console.warn('[Login] Firestore snapshot error:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('[Login] Firestore setup error:', e);
    }
  }, []);

  // Combine prop users, cloud Firestore users, localStorage users, and initial fallback users
  const availableUsers = useMemo<UserAccount[]>(() => {
    let stored: UserAccount[] = [];
    try {
      const raw = localStorage.getItem('stockmaster_users');
      if (raw) {
        stored = JSON.parse(raw);
      }
    } catch (e) {}

    const map = new Map<string, UserAccount>();

    // Priority: INITIAL_USERS -> stored users -> propUsers -> cloudUsers
    INITIAL_USERS.forEach((u) => map.set(u.email.toLowerCase().trim(), u));
    if (Array.isArray(stored)) {
      stored.forEach((u) => {
        if (u && u.email) map.set(u.email.toLowerCase().trim(), u);
      });
    }
    if (Array.isArray(propUsers)) {
      propUsers.forEach((u) => {
        if (u && u.email) map.set(u.email.toLowerCase().trim(), u);
      });
    }
    if (Array.isArray(cloudUsers)) {
      cloudUsers.forEach((u) => {
        if (u && u.email) map.set(u.email.toLowerCase().trim(), u);
      });
    }

    return Array.from(map.values());
  }, [propUsers, cloudUsers]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.toLowerCase().trim();
      const cleanPassword = password.trim();

      // Find user from combined available users
      const matchedUser = availableUsers.find(
        (u) => u.email.toLowerCase().trim() === cleanEmail
      );

      if (!matchedUser) {
        setErrorMessage('Email tidak terdaftar pada sistem penanggung jawab.');
        return;
      }

      if (matchedUser.password !== cleanPassword) {
        setErrorMessage('Security key / kata sandi yang Anda masukkan tidak valid.');
        return;
      }

      if (matchedUser.status === 'inactive') {
        setErrorMessage(
          'Akun Anda saat ini NONAKTIF. Hubungi Administrator Utama untuk mengaktifkan kembali.'
        );
        return;
      }

      // Successful login
      onLoginSuccess(matchedUser);
    }, 400);
  };

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center bg-slate-100 text-slate-800 p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background SVG Grid Pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Login Box */}
      <div className="w-full max-w-[440px] bg-white border border-slate-200 rounded-2xl relative z-10 flex flex-col overflow-hidden shadow-xl">
        <div className="p-6 md:p-8 flex flex-col items-center">
          {/* Logo Badge */}
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold mb-4 shadow-md">
            <span className="material-symbols-outlined text-[30px]">package_2</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-slate-900 text-center mb-1 tracking-tight">
            StockMaster System
          </h1>
          <p className="text-xs font-medium text-slate-500 text-center mb-6">
            Masuk untuk Mengelola Stok & Akses Penanggung Jawab
          </p>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="w-full p-3 mb-5 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg flex items-start gap-2.5 animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0 mt-0.5">
                warning
              </span>
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Email Penanggung Jawab
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200 pointer-events-none text-[18px]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200 pointer-events-none text-[18px]">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 mt-1">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer select-none">
                Ingat sesi masuk
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors duration-200 mt-2 flex items-center justify-center cursor-pointer shadow-sm group"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Masuk Sekarang
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-200">
                    arrow_forward
                  </span>
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Card Footer */}
        <div className="bg-slate-50 p-3.5 flex items-center justify-center gap-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          <span className="material-symbols-outlined text-[15px] text-emerald-600">
            cloud_sync
          </span>
          <span>Database Cloud Online Realtime Terhubung</span>
        </div>
      </div>
    </div>
  );
};
