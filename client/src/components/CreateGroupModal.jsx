import React, { useState, useEffect } from 'react';
import { X, Search, Check, UserPlus } from 'lucide-react';
import { api } from '../api';

export default function CreateGroupModal({ isOpen, onClose, onRoomCreated }) {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setGroupName('');
      setSelectedUserIds([]);
      setError('');
    }
  }, [isOpen]);

  const loadUsers = async () => {
    const list = await api.getUsers();
    setUsers(list || []);
  };

  const toggleUser = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Vui lòng nhập tên nhóm');
      return;
    }
    if (selectedUserIds.length < 2) {
      setError('Nhóm cần chọn ít nhất 2 thành viên khác');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // POST /rooms: { name: "TenNhom", memberIds: ["id1", "id2"] }
      const room = await api.createRoom({
        name: groupName.trim(),
        memberIds: selectedUserIds
      });
      onRoomCreated(room);
      onClose();
    } catch {
      setError('Không thể tạo nhóm lúc này');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      {/* Modal Dialog khớp 100% bản Figma screenshot #5 */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="p-6 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tạo nhóm mới</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tạo không gian trò chuyện cùng các thành viên trong nhóm</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateGroup}>
          <div className="px-6 py-2 space-y-4">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Input Tên nhóm */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên nhóm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên nhóm"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            {/* Header Danh sách chọn thành viên */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-semibold text-slate-700">
                Thành viên tham gia
              </label>
              <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Đã chọn {selectedUserIds.length}
              </span>
            </div>

            {/* User List */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {users.map(user => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-50/70 border border-indigo-200' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
                          {user.displayName?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">{user.displayName}</h4>
                        <p className="text-[11px] text-slate-400">{user.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 mt-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !groupName.trim() || selectedUserIds.length < 2}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Đang tạo...' : 'Tạo nhóm'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
