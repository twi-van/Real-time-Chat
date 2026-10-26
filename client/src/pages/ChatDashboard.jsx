import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, 
  MessageSquarePlus, 
  Users, 
  Send, 
  Hash, 
  User, 
  ChevronRight,
  Circle,
  MoreVertical,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import { api } from '../api';
import { useSocket } from '../hooks/useSocket';
import NewChatModal from '../components/NewChatModal';
import CreateGroupModal from '../components/CreateGroupModal';

export default function ChatDashboard({ currentUser, token, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTypingMap, setIsTypingMap] = useState({}); // { [roomId]: { userId, displayName } }
  const [presenceByUser, setPresenceByUser] = useState({});
  const [mobileView, setMobileView] = useState('sidebar'); // 'sidebar' | 'chat'
  
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isInitialLoadRef = useRef(true);
  const prevScrollHeightRef = useRef(0);

  // Modals
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const remoteTypingTimersRef = useRef({});
  const activeRoomIdRef = useRef(activeRoomId);

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  // Cuộn xuống đáy mượt mà
  const scrollToBottom = (behavior = 'smooth') => {
    requestAnimationFrame(() => {
      const el = messagesContainerRef.current;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior });
      }
    });
  };

  // Callback nhận tin nhắn từ Socket / Mock
  const handleMessageReceived = (msg) => {
    const normalizedMessage = {
      ...msg,
      senderId: msg.senderId ?? msg.sender?.id,
    };
    if (normalizedMessage.roomId === activeRoomIdRef.current) {
      setMessages(prev => {
        if (prev.some(m => m.id === normalizedMessage.id)) return prev;
        return [...prev, normalizedMessage];
      });
      // Tự động cuộn xuống đáy khi có tin mới tới (kể cả mình gửi hoặc đối phương gửi)
      setTimeout(() => scrollToBottom('smooth'), 50);
    }

    // Cập nhật preview tin mới nhất ở sidebar
    setRooms(prev => prev.map(r => {
      if (r.id === normalizedMessage.roomId) {
        return {
          ...r,
          lastMessage: {
            content: normalizedMessage.content,
            createdAt: normalizedMessage.createdAt,
            senderId: normalizedMessage.senderId
          }
        };
      }
      return r;
    }));
  };

  // Callback trạng thái typing
  const handleTypingUpdate = ({ roomId, userId, isTyping }) => {
    if (userId === currentUser?.id) return;
    const existingTimer = remoteTypingTimersRef.current[roomId];
    if (existingTimer) clearTimeout(existingTimer);

    setIsTypingMap(prev => {
      if (isTyping) {
        // Tìm tên thành viên
        const room = rooms.find(r => r.id === roomId);
        const member = room?.members?.find(m => m.id === userId);
        return { ...prev, [roomId]: { userId, displayName: member?.displayName || 'Ai đó' } };
      } else {
        const next = { ...prev };
        delete next[roomId];
        return next;
      }
    });

    if (isTyping) {
      remoteTypingTimersRef.current[roomId] = setTimeout(() => {
        setIsTypingMap(prev => {
          const next = { ...prev };
          delete next[roomId];
          return next;
        });
        delete remoteTypingTimersRef.current[roomId];
      }, 5000);
    } else {
      delete remoteTypingTimersRef.current[roomId];
    }
  };

  // Callback presence
  const handlePresenceUpdate = ({ userId, status }) => {
    setPresenceByUser(prev => ({ ...prev, [userId]: status === 'online' }));
    setRooms(prev => prev.map(r => ({
      ...r,
      members: r.members?.map(m => m.id === userId ? { ...m, isOnline: status === 'online' } : m)
    })));
  };

  // Khởi tạo socket hook
  const { isConnected, sendMessage, sendTyping } = useSocket(
    token, 
    activeRoomId, 
    handleMessageReceived, 
    handlePresenceUpdate, 
    handleTypingUpdate
  );

  // Load danh sách phòng
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    const list = await api.getRooms();
    setRooms(list || []);
    if (list && list.length > 0 && !activeRoomId) {
      setActiveRoomId(list[0].id);
    }
  };

  // Khi chọn room -> tải lịch sử tin ban đầu và cuộn xuống đáy
  useEffect(() => {
    if (activeRoomId) {
      isInitialLoadRef.current = true;
      loadInitialMessages(activeRoomId);
    }
  }, [activeRoomId]);

  const loadInitialMessages = async (roomId) => {
    const res = await api.getMessages(roomId, null, 20);
    const msgs = res.messages || [];
    setMessages(msgs);
    setNextCursor(res.nextCursor || null);
    setHasMore(!!res.nextCursor);

    // Cuộn xuống đáy sau khi render danh sách tin ban đầu
    setTimeout(() => {
      scrollToBottom('auto');
      isInitialLoadRef.current = false;
    }, 60);
  };

  // Tải thêm lịch sử tin nhắn khi cuộn lên đỉnh (Cursor Pagination)
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !nextCursor || !activeRoomId) return;

    const container = messagesContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
    }

    setIsLoadingMore(true);
    try {
      const res = await api.getMessages(activeRoomId, nextCursor, 15);
      const olderMessages = res.messages || [];
      if (olderMessages.length > 0) {
        setMessages(prev => {
          // Lọc trùng lặp tin nhắn
          const existingIds = new Set(prev.map(m => m.id));
          const filtered = olderMessages.filter(m => !existingIds.has(m.id));
          return [...filtered, ...prev];
        });
        setNextCursor(res.nextCursor || null);
        setHasMore(!!res.nextCursor);

        // Giữ nguyên vị trí cuộn mượt mà sau khi chèn thêm tin nhắn phía trên
        requestAnimationFrame(() => {
          if (container) {
            const addedHeight = container.scrollHeight - prevScrollHeightRef.current;
            container.scrollTop = addedHeight;
          }
        });
      } else {
        setHasMore(false);
        setNextCursor(null);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Lắng nghe sự kiện scroll trên messagesContainer để tự động nạp tin nhắn cũ
  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop <= 30 && hasMore && !isLoadingMore && !isInitialLoadRef.current) {
      loadMoreMessages();
    }
  };

  // Xử lý gửi tin
  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeRoomId) return;

    const content = inputText.trim();
    if (sendMessage(content)) {
      setInputText('');
      sendTyping(false);
      setTimeout(() => scrollToBottom('smooth'), 50);
    }
  };

  // Xử lý gõ phím -> trigger typing indicator
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    sendTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2500);
  };

  // Helper lấy thông tin hiển thị của room theo Sprint 1 rule:
  // - Nếu room đúng 2 members: hiện tên & avatar của đối phương
  // - Nếu room >= 3 members: hiện tên nhóm (name)
  const getRoomDisplayInfo = (room) => {
    if (!room) return { title: '', isGroup: false, subtitle: '', isOnline: false };
    const members = room.members || [];
    const isTwoMembers = members.length === 2;

    if (isTwoMembers) {
      const other = members.find(m => m.id !== currentUser?.id) || members[0];
      const isOnline = presenceByUser[other?.id] ?? !!other?.isOnline;
      return {
        title: other?.displayName || 'Người dùng',
        isGroup: false,
        isOnline,
        subtitle: isOnline ? 'Đang hoạt động' : 'Ngoại tuyến',
        avatarText: other?.displayName?.slice(0, 2).toUpperCase() || 'TV'
      };
    } else {
      return {
        title: room.name || 'Nhóm trò chuyện',
        isGroup: true,
        isOnline: true,
        subtitle: `${members.length} thành viên • ${members.filter(m => m.isOnline).length} trực tuyến`,
        avatarText: '#'
      };
    }
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const activeRoomInfo = getRoomDisplayInfo(activeRoom);
  const typingInfo = activeRoomId ? isTypingMap[activeRoomId] : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-800 font-sans">
      
      {/* ===================== SIDEBAR ===================== */}
      <aside className={`w-full md:w-80 md:flex-shrink-0 flex flex-col border-r border-slate-100 bg-[#fafafa]/80 ${
        mobileView === 'sidebar' ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* User Profile Header (Figma mockup góc trái trên) */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-slate-100/80 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs tracking-wide shadow-md shadow-indigo-500/20">
                {currentUser?.displayName?.slice(0, 2).toUpperCase() || 'KL'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.displayName || 'Kim Lợi'}
              </h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Đang hoạt động</span>
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="flex items-center gap-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-all text-xs font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>

        {/* Action Buttons: 2 nút đã chốt Sprint 1 */}
        <div className="p-4 space-y-2.5 bg-white border-b border-slate-100">
          {/* Nút 1: Chat mới */}
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold rounded-2xl shadow-md shadow-indigo-600/15 cursor-pointer transition-all active:scale-[0.99]"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>+ Chat mới</span>
          </button>

          {/* Nút 2: Tạo nhóm */}
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50/80 hover:bg-indigo-100/70 text-[#4f46e5] text-xs font-semibold rounded-2xl border border-indigo-100/60 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Users className="w-4 h-4" />
            <span>+ Tạo nhóm</span>
          </button>
        </div>

        {/* Room List (Sidebar items theo Figma) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {rooms.map(room => {
            const isSelected = room.id === activeRoomId;
            const info = getRoomDisplayInfo(room);

            return (
              <div
                key={room.id}
                onClick={() => {
                  setActiveRoomId(room.id);
                  setMobileView('chat');
                }}
                className={`group flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                  isSelected 
                    ? 'bg-indigo-50/80 text-slate-900 border border-indigo-200/60 shadow-sm' 
                    : 'hover:bg-slate-100/70 text-slate-700 border border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {info.isGroup ? (
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      <Hash className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {info.avatarText}
                    </div>
                  )}
                  {!info.isGroup && info.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                {/* Info & Last message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-xs truncate ${isSelected ? 'font-bold text-indigo-950' : 'font-semibold text-slate-800'}`}>
                      {info.isGroup ? `# ${info.title}` : info.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {room.lastMessage?.createdAt 
                        ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Mới'
                      }
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate line-clamp-1">
                    {room.lastMessage?.content || 'Chưa có tin nhắn'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ===================== CHAT MAIN CONTAINER ===================== */}
      <main className={`flex-1 flex-col h-full bg-[#f8fafc]/50 min-w-0 overflow-hidden ${
        mobileView === 'chat' ? 'flex' : 'hidden md:flex'
      }`}>
        
        {activeRoom ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header phòng chat (Figma mockup ảnh #3 & #4) */}
            <header className="h-18 px-4 sm:px-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                {/* Nút quay lại trên mobile */}
                <button
                  onClick={() => setMobileView('sidebar')}
                  className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Quay lại danh sách phòng"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  {activeRoomInfo.isGroup ? (
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                      <Hash className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {activeRoomInfo.avatarText}
                    </div>
                  )}
                  {!activeRoomInfo.isGroup && activeRoomInfo.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">
                    {activeRoomInfo.isGroup ? `# ${activeRoomInfo.title}` : activeRoomInfo.title}
                  </h1>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeRoomInfo.isGroup ? 'bg-slate-400' : activeRoomInfo.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span>{activeRoomInfo.subtitle}</span>
                  </p>
                </div>
              </div>
            </header>

            {/* Vùng tin nhắn cuộn */}
            <div 
              ref={messagesContainerRef} 
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
            >
              {/* Chỉ báo trạng thái tải lịch sử (Cursor pagination) */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-2 animate-fade-in">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-600 text-[11px] font-medium shadow-xs">
                    <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang tải thêm tin nhắn cũ...</span>
                  </div>
                </div>
              )}

              {hasMore && !isLoadingMore && (
                <div className="flex justify-center pt-1 pb-2">
                  <button
                    onClick={loadMoreMessages}
                    className="text-[11px] font-medium text-slate-400 hover:text-indigo-600 hover:bg-slate-100/80 px-3 py-1 rounded-full border border-dashed border-slate-200 transition-all cursor-pointer"
                  >
                    ↑ Cuộn lên hoặc bấm để tải tin cũ hơn
                  </button>
                </div>
              )}

              {!hasMore && messages.length > 15 && (
                <div className="text-center py-1">
                  <span className="text-[10px] text-slate-400 italic">Đã tải hết lịch sử trò chuyện</span>
                </div>
              )}

              {/* Divider Ngày */}
              <div className="flex items-center justify-center my-3">
                <span className="px-4 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">
                  Hôm nay, {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>

              {messages.map(msg => {
                const isMe = msg.senderId === (currentUser?.id || 'u1');
                const senderName = msg.sender?.displayName || (isMe ? 'Bạn' : 'Người khác');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
                  >
                    {/* Tên người gửi & giờ */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                      {!isMe && <span className="font-semibold text-slate-700">{senderName}</span>}
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <span className="font-medium text-indigo-600">• Bạn</span>}
                    </div>

                    <div className="flex items-end gap-2 max-w-[75%] sm:max-w-[65%]">
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-[10px] mb-1">
                          {senderName.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      {/* Bong bóng tin nhắn khớp Figma */}
                      <div
                        className={`p-3.5 px-4.5 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isMe 
                            ? 'bg-[#4f46e5] text-white rounded-br-xs font-normal' 
                            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-xs font-normal shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {typingInfo && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic px-2 py-1 animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>{typingInfo.displayName} đang soạn tin...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Ô nhập tin nhắn (Figma mockup góc dưới) */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
                  className="flex-1 py-3 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="flex items-center justify-center gap-2 py-3 px-5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-40 transition-all active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-[#4f46e5] flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Chọn một phòng chat</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Bắt đầu trò chuyện bằng cách bấm chọn ở cột bên trái hoặc bấm Chat mới / Tạo nhóm.
            </p>
          </div>
        )}

      </main>

      {/* Modals */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onlineUsers={presenceByUser}
        onClose={() => setIsNewChatOpen(false)}
        onRoomCreated={(newRoom) => {
          setRooms(prev => [newRoom, ...prev.filter(r => r.id !== newRoom.id)]);
          setActiveRoomId(newRoom.id);
          setMobileView('chat');
        }}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onlineUsers={presenceByUser}
        onClose={() => setIsCreateGroupOpen(false)}
        onRoomCreated={(newRoom) => {
          setRooms(prev => [newRoom, ...prev.filter(r => r.id !== newRoom.id)]);
          setActiveRoomId(newRoom.id);
          setMobileView('chat');
        }}
      />

    </div>
  );
}
