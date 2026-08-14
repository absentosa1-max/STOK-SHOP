import React, { useState } from 'react';
import { UserAccount } from '../types';

interface LoginScreenProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess }) => {
  const primaryAdmin = users.find((u) => u.isPrimaryAdmin) || users[0];

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
      const matchedUser = users.find(
        (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
      );

      if (!matchedUser) {
        setErrorMessage('Email tidak terdaftar pada sistem penanggung jawab.');
        return;
      }

      if (matchedUser.password !== password) {
        setErrorMessage('Security key / kata sandi yang Anda masukkan tidak valid.');
        return;
      }

      if (matchedUser.status === 'inactive') {
        setErrorMessage(
          'Akun Anda saat ini NONAKTIF. Hubungi Administrator Utama (admin.utama@stockmaster.com) untuk mengaktifkan kembali.'
        );
        return;
      }

      onLoginSuccess(matchedUser);
    }, 600);
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
        <div className="p-8 flex flex-col items-center">
          {/* Logo Badge */}
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold mb-4 shadow-md">
            <span className="material-symbols-outlined text-[30px]">package_2</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-slate-900 text-center mb-1 tracking-tight">
            StockMaster System
          </h1>
          <p className="text-xs font-medium text-slate-500 text-center mb-6">
            Masuk untuk Mengelola Stok & Akses Pengguna
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
                Email Kerja
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
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
                <a
                  href="#reset"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Gunakan email: "yanz@abs.com" dan kata sandi: "yanz123".');
                  }}
                  className="text-xs font-medium text-blue-600 hover:underline transition-colors"
                >
                  Bantuan Sandi?
                </a>
              </div>
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
                Simpan sesi masuk (30 Hari)
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
          <span className="material-symbols-outlined text-[15px] text-blue-600">
            security
          </span>
          <span>Akses Terenkripsi & Sistem Multi-Pengguna</span>
        </div>
      </div>
    </div>
  );
};
