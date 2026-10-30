import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

function notifySocketError(code) {
  const messages = {
    RATE_LIMITED: 'Báº¡n gá»­i quÃ¡ nhanh. Vui lÃ²ng thá»­ láº¡i sau.',
    FORBIDDEN: 'Báº¡n khÃ´ng cÃ³ quyá»n gá»­i tin nháº¯n trong phÃ²ng nÃ y.',
    VALIDATION_ERROR: 'Tin nháº¯n khÃ´ng há»£p lá»‡. Vui lÃ²ng thá»­ láº¡i.',
  };
  window.dispatchEvent(new CustomEvent('chat:error', {
    detail: { message: messages[code] || 'KhÃ´ng gá»­i Ä‘Æ°á»£c tin nháº¯n. Vui lÃ²ng thá»­ láº¡i.' },
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

    // Káº¿t ná»‘i socket vá»›i JWT auth token theo Ä‘Ãºng api-contract.md má»¥c 3
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('âš¡ Socket connected:', socket.id);
      setIsConnected(true);
      if (activeRoomId) {
        socket.emit('join_room', { roomId: activeRoomId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('ðŸ”Œ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
      setIsConnected(false);
      // Náº¿u server socket tá»« chá»‘i vÃ¬ lÃ½ do xÃ¡c thá»±c UNAUTHORIZED (api-contract má»¥c 4)
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

  // Quáº£n lÃ½ join_room / leave_room khi activeRoomId thay Ä‘á»•i
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isConnected || !activeRoomId) return;

    socket.emit('join_room', { roomId: activeRoomId });

    return () => {
      socket.emit('leave_room', { roomId: activeRoomId });
    };
  }, [activeRoomId, isConnected]);

  // Gá»­i tin nháº¯n
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
      // Khi BE chÆ°a cháº¡y socket, mÃ´ phá»ng lÆ°u mock tin nháº¯n ngay láº­p tá»©c
      const mockMsg = api.sendMockMessage(activeRoomId, content);
      if (onMessageRef.current) {
        onMessageRef.current(mockMsg);
      }

      // Giáº£ láº­p bot/thÃ nh viÃªn khÃ¡c pháº£n há»“i nháº¹ sau 1.5s Ä‘á»ƒ demo sá»‘ng Ä‘á»™ng
      if (window._demoAutoReplyEnabled !== false) {
        setTimeout(() => {
          const autoReply = {
            id: 'auto-' + Date.now(),
            roomId: activeRoomId,
            content: 'Nháº­n Ä‘Æ°á»£c rá»“i nhÃ©! Há»‡ thá»‘ng realtime chat Ä‘ang cháº¡y mÆ°á»£t mÃ  âœ¨',
            senderId: 'u2',
            sender: { id: 'u2', displayName: 'ThÃ¹y VÃ¢n' },
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
      detail: { message: 'Máº¥t káº¿t ná»‘i mÃ¡y chá»§. Tin nháº¯n chÆ°a Ä‘Æ°á»£c gá»­i.' },
    }));
    return false;
  }, [activeRoomId, isConnected, token]);

  // Gá»­i event typing
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
