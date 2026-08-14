import React, { useState, useEffect, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error('Captured window error:', event.error || event.message);
      setHasError(true);
      setErrorMessage(event.message || 'Unknown error');
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Captured unhandled promise rejection:', event.reason);
      setHasError(true);
      setErrorMessage(event.reason?.message || String(event.reason) || 'Promise rejection error');
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  const handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">Terjadi Kendala Memuat Aplikasi</h1>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Aplikasi mendeteksi kendala pada browser atau sesi lokal. Anda dapat mereset data lokal dan memuat ulang halaman.
          </p>
          {errorMessage && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded text-left font-mono text-[11px] text-rose-700 overflow-x-auto max-h-32">
              {errorMessage}
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition-colors cursor-pointer"
            >
              Muat Ulang
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reset Cache & Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
