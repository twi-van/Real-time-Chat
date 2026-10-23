import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../api';

export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.register(displayName, email, password);
      if (res.success) {
        onRegisterSuccess(res.data.user, res.data.token);
      } else {
        setError(res.message || 'Đăng ký không thành công');
      }
    } catch {
      setError('Lỗi kết nối hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#ede9fe] p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      {/* Container Card khớp 100% Figma */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-slate-100 p-8 sm:p-10 transition-all duration-300">
        
        {/* Logo & Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#4338ca] to-[#6366f1] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 text-white">
            <MessageSquare className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tạo tài khoản mới</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">Tham gia cộng đồng chat realtime</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên hiển thị */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên hiển thị
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên của bạn"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200 tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Xác nhận mật khẩu
            </label>
            <div className="relative flex items-center">
              <ShieldCheck className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200 tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 mt-2 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-70 cursor-pointer"
          >
            <span>{loading ? 'Đang tạo...' : 'Đăng ký tài khoản'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-7 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <button
            onClick={onNavigateToLogin}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Hệ thống trò chuyện thời gian thực</span>
      </div>
    </div>
  );
}
