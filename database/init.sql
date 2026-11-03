BEGIN;

-- ===================== CẤU TRÚC (schema.sql) =====================

-- ---------------------------------------------------------------------
-- Bảng users : tài khoản người dùng
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "users" (
    "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
    "email"         TEXT          NOT NULL,
    "password_hash" TEXT          NOT NULL,
    "display_name"  TEXT          NOT NULL,
    "created_at"    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- ---------------------------------------------------------------------
-- Bảng rooms : phòng chat
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "rooms" (
    "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
    "name"          TEXT,
    "created_by_id" UUID          NOT NULL,
    "created_at"    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rooms_created_by_id_fkey"
        FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "rooms_created_by_id_idx" ON "rooms"("created_by_id");

-- ---------------------------------------------------------------------
-- Bảng room_members : thành viên của phòng (quan hệ n-n giữa users và rooms)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "room_members" (
    "room_id"   UUID          NOT NULL,
    "user_id"   UUID          NOT NULL,
    "joined_at" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_members_pkey" PRIMARY KEY ("room_id", "user_id"),
    CONSTRAINT "room_members_room_id_fkey"
        FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "room_members_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "room_members_user_id_idx" ON "room_members"("user_id");

-- ---------------------------------------------------------------------
-- Bảng messages : tin nhắn trong phòng
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "messages" (
    "id"         UUID          NOT NULL DEFAULT gen_random_uuid(),
    "room_id"    UUID          NOT NULL,
    "sender_id"  UUID          NOT NULL,
    "content"    TEXT          NOT NULL,
    "created_at" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "messages_room_id_fkey"
        FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_sender_id_fkey"
        FOREIGN KEY ("sender_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Dùng cho phân trang theo thời gian
CREATE UNIQUE INDEX IF NOT EXISTS "messages_created_at_id_key"
    ON "messages"("created_at", "id");

-- Lấy tin nhắn mới nhất của một phòng
CREATE INDEX IF NOT EXISTS "messages_room_id_created_at_id_idx"
    ON "messages"("room_id", "created_at" DESC, "id" DESC);

-- ===================== DỮ LIỆU MẪU (seed.sql) =====================

INSERT INTO "users" ("email", "password_hash", "display_name") VALUES
    ('a@a.com', '$2b$10$AuCuh.vgivU/bXqtQkMSBeLDC./8zhNdABYqs08VtY5wPk5QOJRXC', 'An'),
    ('b@b.com', '$2b$10$AuCuh.vgivU/bXqtQkMSBeLDC./8zhNdABYqs08VtY5wPk5QOJRXC', 'Bình'),
    ('c@c.com', '$2b$10$AuCuh.vgivU/bXqtQkMSBeLDC./8zhNdABYqs08VtY5wPk5QOJRXC', 'Chi')
ON CONFLICT ("email") DO UPDATE
    SET "password_hash" = EXCLUDED."password_hash",
        "display_name"  = EXCLUDED."display_name";

COMMIT;
