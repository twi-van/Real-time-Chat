import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatDashboard from './pages/ChatDashboard';
import { api } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('chat_user') || 'null');
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('chat_token') || null;
  });
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const handleUnauthorizedEvent = (e) => {
      const msg = e.detail?.message || 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.';
      setCurrentUser(null);
      setToken(null);
      setAuthView('login');
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 4500);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorizedEvent);
    const handleChatError = (e) => {
      setToastMessage(e.detail?.message || 'Đã xảy ra lỗi khi kết nối chat.');
      setTimeout(() => setToastMessage(''), 4500);
    };
    window.addEventListener('chat:error', handleChatError);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorizedEvent);
      window.removeEventListener('chat:error', handleChatError);
    };
  }, []);

  const handleAuthSuccess = (user, jwtToken) => {
    setCurrentUser(user);
    setToken(jwtToken);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setToken(null);
    setAuthView('login');
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 text-white text-xs font-medium rounded-2xl shadow-xl backdrop-blur-md border border-slate-700/50 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage('')}
            className="ml-2 text-slate-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {(!token || !currentUser) ? (
        authView === 'register' ? (
          <Register
            onRegisterSuccess={handleAuthSuccess}
            onNavigateToLogin={() => setAuthView('login')}
          />
        ) : (
          <Login
            onLoginSuccess={handleAuthSuccess}
            onNavigateToRegister={() => setAuthView('register')}
          />
        )
      ) : (
        <ChatDashboard
          currentUser={currentUser}
          token={token}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
