# UI Outline

**Phá»¥ trÃ¡ch:** Kim Lá»£i (Frontend)

**Tráº¡ng thÃ¡i:** ÄÃ£ chá»‘t (Sprint 1) â€” má»™t loáº¡i room (khÃ´ng phÃ¢n DIRECT/GROUP)

**Figma:** [Xem thiáº¿t káº¿ giao diá»‡n](https://www.figma.com/design/p9CSveBM2QmF7iGfhQ2dz8/Untitled?node-id=0-1&t=aMD0eCyfjNMRCHv7-1)

**MVP UI:** chat theo room thá»‘ng nháº¥t â€” cÃ³ thá»ƒ 2 ngÆ°á»i hoáº·c nhiá»u ngÆ°á»i (cÃ¹ng API táº¡o room). KhÃ´ng lÃ m Join báº±ng link.

---

## 1. CÃ¡c mÃ n hÃ¬nh chÃ­nh

á»¨ng dá»¥ng gá»“m 3 mÃ n hÃ¬nh vÃ  **2 modal** (cÃ¹ng gá»i `POST /rooms`, khÃ¡c sá»‘ ngÆ°á»i chá»n):

### 1.1. MÃ n hÃ¬nh ÄÄƒng nháº­p (`/login`)

- Ã”: Email, Máº­t kháº©u (báº­t/táº¯t xem máº­t kháº©u).
- NÃºt ÄÄƒng nháº­p, link sang ÄÄƒng kÃ½, gá»£i Ã½ tÃ i khoáº£n demo.



### 1.2. MÃ n hÃ¬nh ÄÄƒng kÃ½ (`/register`)

- Ã”: TÃªn hiá»ƒn thá»‹, Email, Máº­t kháº©u, XÃ¡c nháº­n máº­t kháº©u.
- NÃºt ÄÄƒng kÃ½ tÃ i khoáº£n, link sang ÄÄƒng nháº­p.



### 1.3. MÃ n hÃ¬nh Chat chÃ­nh (`/chat`)

**Sidebar:**

- User hiá»‡n táº¡i (avatar, displayName, online, ÄÄƒng xuáº¥t).
- NÃºt **Chat má»›i** â†’ modal chá»n 1 ngÆ°á»i (chat Ä‘Ã´i).
- NÃºt **Táº¡o nhÃ³m** â†’ modal tÃªn + nhiá»u ngÆ°á»i.
- Danh sÃ¡ch room: tÃªn hiá»ƒn thá»‹, tin má»›i nháº¥t, giá», highlight Ä‘ang chá»n.
  - Room Ä‘Ãºng 2 member (tÃ­nh cáº£ mÃ¬nh): hiá»‡n tÃªn Ä‘á»‘i phÆ°Æ¡ng.
  - Room nhiá»u hÆ¡n 2 member: hiá»‡n `name` nhÃ³m.

**Khung chat:**

- Header: tÃªn (Ä‘á»‘i phÆ°Æ¡ng hoáº·c tÃªn nhÃ³m), online / sá»‘ thÃ nh viÃªn.
- VÃ¹ng tin, typing, Ã´ nháº­p (Enter gá»­i, Shift+Enter xuá»‘ng dÃ²ng) + Gá»­i.



### 1.4. Modal Chat má»›i (2 ngÆ°á»i)

- `GET /users` â†’ chá»n Ä‘Ãºng 1 ngÆ°á»i.
- NÃºt Há»§y / Báº¯t Ä‘áº§u chat.
- Gá»i API:

```json
{
  "memberIds": ["userIdDuocChon"]
}
```

`POST /rooms` â€” khÃ´ng gá»­i `type`; `name` cÃ³ thá»ƒ bá» trá»‘ng.

- Xong â†’ vÃ o room, `join_room` + táº£i lá»‹ch sá»­.
- BE chá»‘ng trÃ¹ng: náº¿u Ä‘Ã£ cÃ³ room Ä‘Ãºng cáº·p 2 ngÆ°á»i â†’ API tráº£ room cÅ©; FE chá»‰ má»Ÿ room Ä‘Ã³.



### 1.5. Modal Táº¡o nhÃ³m (tá»« 3 ngÆ°á»i ká»ƒ cáº£ mÃ¬nh)

- Ã” TÃªn nhÃ³m (báº¯t buá»™c).
- `GET /users` â†’ checkbox nhiá»u ngÆ°á»i.
- Gá»i API:

```json
{
  "name": "TenNhom",
  "memberIds": ["id1", "id2"]
}
```

`POST /rooms` â€” xong â†’ vÃ o room nhÆ° trÃªn.

---



## 2. Luá»“ng ngÆ°á»i dÃ¹ng

```text
[Má»Ÿ Web]
   |-- ChÆ°a token --> Login/Register --> JWT
   +-- CÃ³ token ------------------------+
                                        v
                            [Socket.io + JWT]
                                        v
                            [MÃ n Chat]
           +-------------+-------------+------------+
           v             v             v            v
    [Chá»n room]   [Chat má»›i]    [Táº¡o nhÃ³m]   [ÄÄƒng xuáº¥t]
           |             |             |
           |      POST /rooms   POST /rooms
           |      (1 memberId)  (name + nhieu)
           v             +------+------+
    [messages + join]           v
    [Chat realtime] <---- [VÃ o room]
```

1. Login/Register â†’ JWT â†’ `/chat`.
2. Ná»‘i socket vá»›i token.
3. Táº¡o room: Chat má»›i (1 ngÆ°á»i) hoáº·c Táº¡o nhÃ³m (tÃªn + nhiá»u) â€” cÃ¹ng `POST /rooms`.
4. Chá»n room â†’ lá»‹ch sá»­ + `join_room`.
5. Realtime: `typing`, `send_message`, `receive_message`.
6. ÄÄƒng xuáº¥t: xÃ³a token + disconnect.

**KhÃ´ng lÃ m MVP:** Join room báº±ng mÃ£/link.

---



## 3. Typing vÃ  Online

- **Typing:** trÃªn Ã´ nháº­p â€” "Ten Ä‘ang soáº¡n tin..." (khoáº£ng 2.5s táº¯t).
- **Presence:** cháº¥m sidebar; header online (room 2 ngÆ°á»i) hoáº·c sá»‘ thÃ nh viÃªn (nhÃ³m).

---



## 4. State API / Socket



### REST


| State                      | Endpoint                                  | UI                           |
| -------------------------- | ----------------------------------------- | ---------------------------- |
| `currentUser`, `token`     | `POST /auth/login`, `POST /auth/register` | PhiÃªn Ä‘Äƒng nháº­p              |
| `users[]`                  | `GET /users`                              | Hai modal chá»n ngÆ°á»i         |
| `rooms[]`                  | `GET /rooms`                              | Sidebar (má»i room cÃ¹ng loáº¡i) |
| `newRoom`                  | `POST /rooms`                             | Táº¡o room (2 ngÆ°á»i hoáº·c nhÃ³m) |
| `messages[]`, `nextCursor` | `GET /rooms/:id/messages`                 | Lá»‹ch sá»­                      |




### Socket


| Event                              | UI             |
| ---------------------------------- | -------------- |
| `join_room` / `leave_room`         | Äá»•i phÃ²ng      |
| `send_message` / `receive_message` | Gá»­i / nháº­n tin |
| `typing`                           | Äang soáº¡n      |
| `presence`                         | Online/offline |


---



## 5. Quyáº¿t Ä‘á»‹nh Ä‘Ã£ chá»‘t (Sprint 1)

- [x] Má»™t loáº¡i room â€” khÃ´ng DIRECT / GROUP
- [x] 3 mÃ n: Login, Register, Chat
- [x] 2 modal: Chat má»›i (1 ngÆ°á»i) + Táº¡o nhÃ³m (tÃªn + nhiá»u ngÆ°á»i)
- [x] CÃ¹ng `POST /rooms` â€” khÃ¡c sá»‘ `memberIds` / cÃ³ `name` hay khÃ´ng
- [x] Sidebar: 2 member â†’ tÃªn Ä‘á»‘i phÆ°Æ¡ng; hÆ¡n 2 â†’ tÃªn nhÃ³m
- [x] Gá»i `GET /users` trong 2 modal
- [x] BE chá»‘ng trÃ¹ng chat Ä‘Ã´i â†’ FE má»Ÿ room tráº£ vá»
- [x] Typing + presence trÃªn UI
- [x] KhÃ´ng lÃ m Join báº±ng link trong MVP
- [x] BÃ¡m `docs/api-contract.md`
- [x] Cáº­p nháº­t Figma cho khá»›p 2 nÃºt (Chat má»›i + Táº¡o nhÃ³m)

---



## 6. Frontend â€” Sprint 2 Ä‘áº¿n 8 (deadline ná»™p Ä‘á»§ **05/11/2026**)



### Sprint 2 â€” Skeleton UI + auth + socket Â· **deadline 25/10/2026**

- [x] Init Vite React JS + Tailwind trong `client/`
- [x] MÃ n Login / Register (gá»i API hoáº·c mock táº¡m)
- [x] Layout Chat (sidebar + khung tin)
- [x] `useSocket`: connect JWT, `join_room`, gá»­i/nháº­n tin
- [x] Figma khá»›p 2 nÃºt (Ä‘Ã£ chá»‘t Sprint 1)



### Sprint 3â€“4 â€” Äá»§ MVP UI Â· **deadline 28/10/2026**

- [x] Modal Chat má»›i + Táº¡o nhÃ³m (`GET /users`, `POST /rooms`)
- [x] Sidebar: tÃªn Ä‘á»‘i phÆ°Æ¡ng / tÃªn nhÃ³m; preview tin
- [x] Typing indicator + online/offline
- [x] Load lá»‹ch sá»­ + cursor (cuá»™n lÃªn)
- [x] ÄÄƒng xuáº¥t (xÃ³a token + disconnect)
- [x] Ná»‘i BE tháº­t, bá» mock



### Sprint 5â€“6 â€” á»”n Ä‘á»‹nh MVP Â· **deadline 31/10/2026**

- [ ] Responsive cÆ¡ báº£n, UX lá»—i (toast 401 â†’ login) 
- [ ] Test 2 tab: room Ä‘Ã´i + room nhÃ³m
- [ ] Fix bug / polish (khÃ´ng Ã´m media/search)



### Sprint 7 â€” Demo sáºµn sÃ ng Â· **deadline 02/11/2026**

- [ ] Cháº¡y theo README cÃ¹ng Hiá»n/VÃ¢n
- [ ] Chuáº©n bá»‹ tÃ i khoáº£n demo trÃªn UI



### Sprint 8 â€” Report + video Â· **deadline 05/11/2026**

- [ ] Viáº¿t report: so sÃ¡nh WS vs SSE/Long Polling + Implementation Frontend â†’ gá»­i **Hiá»n** trÆ°á»›c **04/11**
- [ ] Quay vÃ  dá»±ng video tá»‘i Ä‘a 20 phÃºt (chá»§ trÃ¬): cÃ³ tiáº¿ng, Ä‘á»§ 3 thÃ nh viÃªn â€” xong trÆ°á»›c **05/11**
- [ ] Demo UI trÃªn video + ghÃ©p pháº§n VÃ¢n/Hiá»n