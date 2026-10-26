import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

function notifySocketError(code) {
  const messages = {
    RATE_LIMITED: 'Bạn gửi quá nhanh. Vui lòng thử lại sau.',
    FORBIDDEN: 'Bạn không có quyền gửi tin nhắn trong phòng này.',
    VALIDATION_ERROR: 'Tin nhắn không hợp lệ. Vui lòng thử lại.',
  };
  window.dispatchEvent(new CustomEvent('chat:error', {
    detail: { message: messages[code] || 'Không gửi được tin nhắn. Vui lòng thử lại.' },
  }));
}

export function useSocket(token, activeRoomId, onMessageReceived, onPresenceUpdate, onTypingUpdate) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessageReceived);
  const onPresenceRef = useRef(onPresenceUpdate);
  const onTypingRef = useRef(onTypingUpdate);

  useEffect(() => {
    onMessageRef.current = onMessageReceived;
    onPresenceRef.current = onPresenceUpdate;
    onTypingRef.current = onTypingUpdate;
  }, [onMessageReceived, onPresenceUpdate, onTypingUpdate]);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Kết nối socket với JWT auth token theo đúng api-contract.md mục 3
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id);
      setIsConnected(true);
      if (activeRoomId) {
        socket.emit('join_room', { roomId: activeRoomId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
      setIsConnected(false);
      // Nếu server socket từ chối vì lý do xác thực UNAUTHORIZED (api-contract mục 4)
      if (err.message?.includes('UNAUTHORIZED') || err.data?.message?.includes('UNAUTHORIZED')) {
        api.handleUnauthorized();
      }
    });

    // Event S -> C: receive_message
    socket.on('receive_message', (msg) => {
      if (onMessageRef.current) {
        onMessageRef.current({
          ...msg,
          senderId: msg.senderId ?? msg.sender?.id,
        });
      }
    });

    // Event S -> C: presence
    socket.on('presence', (data) => {
      if (onPresenceRef.current) {
        onPresenceRef.current(data);
      }
    });

    // Event S -> C: typing
    socket.on('typing', (data) => {
      if (onTypingRef.current) {
        onTypingRef.current(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Quản lý join_room / leave_room khi activeRoomId thay đổi
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isConnected || !activeRoomId) return;

    socket.emit('join_room', { roomId: activeRoomId });

    return () => {
      socket.emit('leave_room', { roomId: activeRoomId });
    };
  }, [activeRoomId, isConnected]);

  // Gửi tin nhắn
  const sendMessage = useCallback((content) => {
    if (!activeRoomId || !content.trim()) return false;

    const socket = socketRef.current;
    if (socket && isConnected) {
      socket.emit('send_message', { roomId: activeRoomId, content }, (result) => {
        if (result?.error) notifySocketError(result.error);
      });
      return true;
    }

    if (token?.startsWith('mock-jwt-token-')) {
      // Khi BE chưa chạy socket, mô phỏng lưu mock tin nhắn ngay lập tức
      const mockMsg = api.sendMockMessage(activeRoomId, content);
      if (onMessageRef.current) {
        onMessageRef.current(mockMsg);
      }

      // Giả lập bot/thành viên khác phản hồi nhẹ sau 1.5s để demo sống động
      if (window._demoAutoReplyEnabled !== false) {
        setTimeout(() => {
          const autoReply = {
            id: 'auto-' + Date.now(),
            roomId: activeRoomId,
            content: 'Nhận được rồi nhé! Hệ thống realtime chat đang chạy mượt mà ✨',
            senderId: 'u2',
            sender: { id: 'u2', displayName: 'Thùy Vân' },
            createdAt: new Date().toISOString()
          };
          api.mockMessages[activeRoomId]?.push(autoReply);
          api.saveMock();
          if (onMessageRef.current) {
            onMessageRef.current(autoReply);
          }
        }, 1500);
      }

      return true;
    }

    window.dispatchEvent(new CustomEvent('chat:error', {
      detail: { message: 'Mất kết nối máy chủ. Tin nhắn chưa được gửi.' },
    }));
    return false;
  }, [activeRoomId, isConnected, token]);

  // Gửi event typing
  const sendTyping = useCallback((isTyping) => {
    const socket = socketRef.current;
    if (socket && isConnected && activeRoomId) {
      socket.emit('typing', { roomId: activeRoomId, isTyping });
    }
  }, [activeRoomId, isConnected]);

  return {
    isConnected,
    sendMessage,
    sendTyping
  };
}
