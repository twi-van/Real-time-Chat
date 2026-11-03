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
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: {
            message:
              'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
          },
        })
      );
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
        message: error.message || error.error || 'Đăng nhập không thành công',
      };
    } catch {
      return {
        success: false,
        message: 'Không kết nối được máy chủ. Hãy chạy Backend (cổng 4000).',
      };
    }
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
        message: error.message || error.error || 'Đăng ký không thành công',
      };
    } catch {
      return {
        success: false,
        message: 'Không kết nối được máy chủ. Hãy chạy Backend (cổng 4000).',
      };
    }
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
      return [];
    }
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
      return [];
    }
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
      return null;
    }
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
      return { messages: [], nextCursor: null };
    }
  }
}

export const api = new ApiService();
