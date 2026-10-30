import { MOCK_USERS, MOCK_INITIAL_ROOMS, MOCK_INITIAL_MESSAGES, MOCK_VERSION } from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const unwrapList = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.[key]) ? payload[key] : [];
};

const normalizeMessage = (message) => ({
  ...message,
  senderId: message.senderId ?? message.sender?.id,
});

const normalizeMessagesResponse = (payload) => ({
  ...payload,
  messages: unwrapList(payload, 'messages').map(normalizeMessage),
  nextCursor: payload?.nextCursor ?? null,
});

class ApiService {
  constructor() {
    this.token = localStorage.getItem('chat_token') || null;
    this.user = JSON.parse(localStorage.getItem('chat_user') || 'null');

    // Kiá»ƒm tra version mock data â€” náº¿u thay Ä‘á»•i thÃ¬ tá»± xÃ³a cache cÅ©
    const savedVersion = localStorage.getItem('mock_version');
    if (savedVersion !== MOCK_VERSION) {
      localStorage.removeItem('mock_rooms');
      localStorage.removeItem('mock_messages');
      localStorage.setItem('mock_version', MOCK_VERSION);
    }

    // In-memory mock store
    this.mockRooms = JSON.parse(localStorage.getItem('mock_rooms') || 'null') || [...MOCK_INITIAL_ROOMS];
    this.mockMessages = JSON.parse(localStorage.getItem('mock_messages') || 'null') || { ...MOCK_INITIAL_MESSAGES };
  }

  saveMock() {
    localStorage.setItem('mock_rooms', JSON.stringify(this.mockRooms));
    localStorage.setItem('mock_messages', JSON.stringify(this.mockMessages));
  }

  setSession(user, token) {
    this.user = user;
    this.token = token;
    if (token) {
      localStorage.setItem('chat_token', token);
      localStorage.setItem('chat_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_user');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  handleUnauthorized() {
    this.logout();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { 
        detail: { message: 'PhiÃªn Ä‘Äƒng nháº­p Ä‘Ã£ háº¿t háº¡n hoáº·c khÃ´ng há»£p lá»‡. Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i.' } 
      }));
    }
  }

  async login(email, password) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        this.setSession(data.user, data.token);
        return { success: true, data };
      }
      const error = await res.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || error.error || 'ÄÄƒng nháº­p khÃ´ng thÃ nh cÃ´ng',
      };
    } catch {
      // Backend offline -> fallback mock
    }

    // Mock Login
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found || email === 'a@a.com') {
      const user = found || { id: 'u1', email, displayName: 'Kim Lá»£i' };
      const token = 'mock-jwt-token-' + Date.now();
      this.setSession(user, token);
      return { success: true, data: { user, token } };
    }
    
    // Default mock user if any credentials provided
    const user = { id: 'u1', email, displayName: email.split('@')[0] || 'User' };
    const token = 'mock-jwt-token-' + Date.now();
    this.setSession(user, token);
    return { success: true, data: { user, token } };
  }

  async register(displayName, email, password) {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        this.setSession(data.user, data.token);
        return { success: true, data };
      }
      const error = await res.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || error.error || 'ÄÄƒng kÃ½ khÃ´ng thÃ nh cÃ´ng',
      };
    } catch {
      // Backend offline -> fallback mock
    }

    const newUser = { id: 'u-' + Date.now(), email, displayName };
    const token = 'mock-jwt-token-' + Date.now();
    this.setSession(newUser, token);
    return { success: true, data: { user: newUser, token } };
  }

  logout() {
    this.setSession(null, null);
  }

  async getUsers() {
    try {
      const res = await fetch(`${BASE_URL}/users`, { headers: this.getHeaders() });
      if (res.status === 401) {
        this.handleUnauthorized();
        return [];
      }
      if (res.ok) return unwrapList(await res.json(), 'users');
      return [];
    } catch {
      // Backend offline
    }
    // Return other mock users (excluding myself)
    return MOCK_USERS.filter(u => u.email !== this.user?.email);
  }

  async getRooms() {
    try {
      const res = await fetch(`${BASE_URL}/rooms`, { headers: this.getHeaders() });
      if (res.status === 401) {
        this.handleUnauthorized();
        return [];
      }
      if (res.ok) return unwrapList(await res.json(), 'rooms');
      return [];
    } catch {
      // Backend offline
    }
    return this.mockRooms;
  }

  async createRoom({ name, memberIds }) {
    try {
      const res = await fetch(`${BASE_URL}/rooms`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name, memberIds }),
      });
      if (res.status === 401) {
        this.handleUnauthorized();
        return null;
      }
      if (res.ok) {
        const payload = await res.json();
        return payload?.room ?? payload;
      }
      return null;
    } catch {
      // Backend offline
    }

    // Logic BE mock: chá»‘ng trÃ¹ng chat Ä‘Ã´i
    if (memberIds.length === 1) {
      const otherId = memberIds[0];
      const existing = this.mockRooms.find(r => 
        r.members.length === 2 && 
        r.members.some(m => m.id === otherId) &&
        r.members.some(m => m.id === (this.user?.id || 'u1'))
      );
      if (existing) {
        return existing;
      }
    }

    // Táº¡o room má»›i
    const allMembers = [
      this.user || { id: 'u1', displayName: 'An', email: 'a@a.com' },
      ...MOCK_USERS.filter(u => memberIds.includes(u.id))
    ];

    const newRoom = {
      id: 'room-' + Date.now(),
      name: name || null,
      createdById: this.user?.id || 'u1',
      createdAt: new Date().toISOString(),
      members: allMembers,
      lastMessage: null
    };

    this.mockRooms.unshift(newRoom);
    this.saveMock();
    return newRoom;
  }

  async getMessages(roomId, cursor = null, limit = 20) {
    try {
      let url = `${BASE_URL}/rooms/${roomId}/messages?limit=${limit}`;
      if (cursor) url += `&cursor=${cursor}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (res.status === 401) {
        this.handleUnauthorized();
        return { messages: [], nextCursor: null };
      }
      if (res.ok) return normalizeMessagesResponse(await res.json());
      return { messages: [], nextCursor: null };
    } catch {
      // Backend offline -> fallback mock
    }

    const allMessages = this.mockMessages[roomId] || [];
    // allMessages Ä‘ang sáº¯p xáº¿p tÄƒng dáº§n theo thá»i gian (cÅ© -> má»›i).
    // Khi táº£i ban Ä‘áº§u (khÃ´ng cursor), láº¥y `limit` tin nháº¯n má»›i nháº¥t á»Ÿ cuá»‘i danh sÃ¡ch.
    // Khi cÃ³ cursor (id tin nháº¯n cÅ© nháº¥t hiá»‡n táº¡i trÃªn FE), láº¥y cÃ¡c tin nháº¯n xuáº¥t hiá»‡n trÆ°á»›c cursor Ä‘Ã³.
    if (!cursor) {
      const startIdx = Math.max(0, allMessages.length - limit);
      const messages = allMessages.slice(startIdx);
      const nextCursor = startIdx > 0 ? messages[0].id : null;
      return { messages, nextCursor };
    } else {
      const cursorIndex = allMessages.findIndex(m => m.id === cursor);
      if (cursorIndex <= 0) {
        return { messages: [], nextCursor: null };
      }
      const startIdx = Math.max(0, cursorIndex - limit);
      const messages = allMessages.slice(startIdx, cursorIndex);
      const nextCursor = startIdx > 0 ? messages[0].id : null;
      return { messages, nextCursor };
    }
  }

  sendMockMessage(roomId, content) {
    if (!this.mockMessages[roomId]) {
      this.mockMessages[roomId] = [];
    }
    const msg = {
      id: 'msg-' + Date.now(),
      roomId,
      content,
      senderId: this.user?.id || 'u1',
      sender: {
        id: this.user?.id || 'u1',
        displayName: this.user?.displayName || 'An'
      },
      createdAt: new Date().toISOString()
    };
    this.mockMessages[roomId].push(msg);

    // Update room lastMessage
    const room = this.mockRooms.find(r => r.id === roomId);
    if (room) {
      room.lastMessage = {
        content,
        createdAt: msg.createdAt,
        senderId: msg.senderId
      };
    }
    this.saveMock();
    return msg;
  }
}

export const api = new ApiService();
