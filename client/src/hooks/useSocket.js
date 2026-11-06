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

export function useSocket(token, activeRoomId, onMessageReceived, onPresenceUpdate, onTypingUpdate, rooms = []) {
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

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      if (activeRoomId) {
        socket.emit('join_room', { roomId: activeRoomId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
      setIsConnected(false);
      if (err.message?.includes('UNAUTHORIZED') || err.data?.message?.includes('UNAUTHORIZED')) {
        api.handleUnauthorized();
      }
    });

    socket.on('receive_message', (msg) => {
      if (onMessageRef.current) {
        onMessageRef.current({
          ...msg,
          senderId: msg.senderId ?? msg.sender?.id,
        });
      }
    });

    socket.on('presence', (data) => {
      if (onPresenceRef.current) {
        onPresenceRef.current(data);
      }
    });

    socket.on('typing', (data) => {
      if (onTypingRef.current) {
        onTypingRef.current(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Tham gia phòng active và lắng nghe tin nhắn mọi phòng của người dùng
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;

    // Join tất cả các phòng người dùng tham gia để nhận tin nhắn realtime ngay lập tức
    rooms.forEach((r) => {
      if (r?.id) {
        socket.emit('join_room', { roomId: r.id });
      }
    });

    if (activeRoomId) {
      socket.emit('join_room', { roomId: activeRoomId });
    }
  }, [rooms, activeRoomId, isConnected]);

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

    window.dispatchEvent(new CustomEvent('chat:error', {
      detail: { message: 'Mất kết nối máy chủ. Tin nhắn chưa được gửi.' },
    }));
    return false;
  }, [activeRoomId, isConnected]);

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
