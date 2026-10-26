import React, { useState, useEffect } from 'react';
import { X, Search, Check, MessageSquare, Users } from 'lucide-react';
import { api } from '../api';

export default function NewChatModal({ isOpen, onClose, onRoomCreated, onlineUsers = {} }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelectedUserId(null);
      setSearch('');
      setError('');
    }
  }, [isOpen]);

  const loadUsers = async () => {
    const list = await api.getUsers();
    setUsers(list || []);
  };

  const handleStartChat = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setError('');
    try {
      // POST /rooms: { memberIds: [selectedUserId] }
      const room = await api.createRoom({
        name: null,
        memberIds: [selectedUserId]
      });
      if (!room) {
        setError('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
        return;
      }
      onRoomCreated(room);
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể tạo cuộc trò chuyện lúc này');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bắt đầu chat mới</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chọn một người để bắt đầu cuộc trò chuyện riêng</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* User List */}
        <div className="px-6 py-3 max-h-60 overflow-y-auto space-y-1.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Thành viên ({filteredUsers.length})
          </div>
          {filteredUsers.map(user => {
            const isSelected = selectedUserId === user.id;
            const isOnline = onlineUsers[user.id] ?? !!user.isOnline;
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-indigo-50 border border-indigo-200 shadow-sm' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
                      {user.displayName?.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{user.displayName}</h4>
                    <p className="text-[11px] text-slate-400">{isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleStartChat}
            disabled={!selectedUserId || loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer transition-all"
          >
            {loading ? 'Đang mở...' : 'Bắt đầu chat'}
          </button>
        </div>

      </div>
    </div>
  );
}
