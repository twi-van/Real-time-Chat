/**
 * Mock Data & Local Storage Simulator
 * Cho phép chạy độc lập hoàn toàn giao diện (Figma 100%) khi BE chưa online.
 * Khi BE online, api.js và useSocket sẽ tự động kết nối API thật!
 */

// Tăng số này mỗi khi muốn reset dữ liệu mock (xóa localStorage cũ tự động)
export const MOCK_VERSION = 'v3';

export const MOCK_USERS = [
  { id: 'u1', email: 'a@a.com', displayName: 'Kim Lợi', isOnline: true },
  { id: 'u2', email: 'b@b.com', displayName: 'Thùy Vân', isOnline: true },
  { id: 'u3', email: 'c@c.com', displayName: 'Diệu Hiền', isOnline: true },
  { id: 'u4', email: 'd@d.com', displayName: 'Minh Hoàng', isOnline: false },
  { id: 'u5', email: 'e@e.com', displayName: 'Thu Hà', isOnline: false },
];

export const MOCK_INITIAL_ROOMS = [
  {
    id: 'room-1',
    name: null, // room đôi -> hiện tên đối phương (Thùy Vân)
    createdById: 'u1',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    members: [
      { id: 'u1', displayName: 'Kim Lợi', email: 'a@a.com', isOnline: true },
      { id: 'u2', displayName: 'Thùy Vân', email: 'b@b.com', isOnline: true }
    ],
    lastMessage: {
      content: 'Tuyệt vời, để mình kiểm tra thêm phần socket handshake nhé!',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      senderId: 'u2'
    }
  },
  {
    id: 'room-2',
    name: 'Nhóm Đồ Án',
    createdById: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    members: [
      { id: 'u1', displayName: 'Kim Lợi', email: 'a@a.com', isOnline: true },
      { id: 'u2', displayName: 'Thùy Vân', email: 'b@b.com', isOnline: true },
      { id: 'u3', displayName: 'Diệu Hiền', email: 'c@c.com', isOnline: true }
    ],
    lastMessage: {
      content: 'Nhớ cập nhật checklist Sprint 5-6 trong ui-outline.md nhé cả nhóm!',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      senderId: 'u3'
    }
  },
  {
    id: 'room-3',
    name: null, // room đôi với Diệu Hiền
    createdById: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    members: [
      { id: 'u1', displayName: 'Kim Lợi', email: 'a@a.com', isOnline: true },
      { id: 'u3', displayName: 'Diệu Hiền', email: 'c@c.com', isOnline: true }
    ],
    lastMessage: {
      content: 'File docker-compose.yml và database schema đã chuẩn hóa rồi nha.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      senderId: 'u3'
    }
  },
  {
    id: 'room-4',
    name: 'Báo Cáo Giữa Kỳ',
    createdById: 'u3',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    members: [
      { id: 'u1', displayName: 'Kim Lợi', email: 'a@a.com', isOnline: true },
      { id: 'u2', displayName: 'Thùy Vân', email: 'b@b.com', isOnline: true },
      { id: 'u3', displayName: 'Diệu Hiền', email: 'c@c.com', isOnline: true }
    ],
    lastMessage: {
      content: 'Format khung Word theo mẫu khoa chuẩn bị hoàn tất.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      senderId: 'u3'
    }
  }
];

// Tạo 35 tin nhắn mẫu cho room-1 theo thứ tự thời gian tăng dần để test cuộn tải cursor
const generateRoom1Messages = () => {
  const msgs = [];
  const baseTime = Date.now() - 3600000 * 12; // 12 tiếng trước
  for (let i = 1; i <= 35; i++) {
    const isMe = i % 2 === 0;
    msgs.push({
      id: `m1-${String(i).padStart(3, '0')}`,
      roomId: 'room-1',
      content: isMe 
        ? `[Lợi] Thảo luận tiến độ tin nhắn #${i}: đã tối ưu hiển thị và socket listener.`
        : `[Vân] Phản hồi tin #${i}: Backend nhận đúng payload và verify JWT thành công.`,
      senderId: isMe ? 'u1' : 'u2',
      sender: {
        id: isMe ? 'u1' : 'u2',
        displayName: isMe ? 'Kim Lợi' : 'Thùy Vân'
      },
      createdAt: new Date(baseTime + i * 1000 * 60 * 15).toISOString()
    });
  }
  return msgs;
};

export const MOCK_INITIAL_MESSAGES = {
  'room-1': generateRoom1Messages(),
  'room-2': [
    {
      id: 'm201',
      roomId: 'room-2',
      content: 'Chào cả nhóm, hôm nay chúng ta bắt đầu Sprint 5–6 nhé!',
      senderId: 'u1',
      sender: { id: 'u1', displayName: 'Kim Lợi' },
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    {
      id: 'm202',
      roomId: 'room-2',
      content: 'Phần auth JWT và WebSocket contract đã sẵn sàng.',
      senderId: 'u2',
      sender: { id: 'u2', displayName: 'Thùy Vân' },
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString()
    },
    {
      id: 'm203',
      roomId: 'room-2',
      content: 'Database Prisma schema và migration cũng đã chốt.',
      senderId: 'u3',
      sender: { id: 'u3', displayName: 'Diệu Hiền' },
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
    },
    {
      id: 'm204',
      roomId: 'room-2',
      content: 'Nhớ cập nhật checklist Sprint 5-6 trong ui-outline.md nhé cả nhóm!',
      senderId: 'u3',
      sender: { id: 'u3', displayName: 'Diệu Hiền' },
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
    }
  ],
  'room-3': [
    {
      id: 'm301',
      roomId: 'room-3',
      content: 'Hiền ơi, xem lại Docker file và biến môi trường giúp Lợi nhé.',
      senderId: 'u1',
      sender: { id: 'u1', displayName: 'Kim Lợi' },
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'm302',
      roomId: 'room-3',
      content: 'File docker-compose.yml và database schema đã chuẩn hóa rồi nha.',
      senderId: 'u3',
      sender: { id: 'u3', displayName: 'Diệu Hiền' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    }
  ],
  'room-4': [
    {
      id: 'm401',
      roomId: 'room-4',
      content: 'Format khung Word theo mẫu khoa chuẩn bị hoàn tất.',
      senderId: 'u3',
      sender: { id: 'u3', displayName: 'Diệu Hiền' },
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]
};
