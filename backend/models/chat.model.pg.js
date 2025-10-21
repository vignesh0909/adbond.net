const pool = require('./db_connection').pool;
const { v4: uuidv4 } = require('uuid');

const createMessagesTableQuery = `
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_message_id TEXT REFERENCES chat_messages(message_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent ON chat_messages(parent_message_id);
`;

pool.query(createMessagesTableQuery).catch((err) => {
    console.error('Error ensuring chat_messages table:', err.message);
});

const mapRowToMessage = (row) => ({
    message_id: row.message_id,
    user_id: row.user_id,
    content: row.content,
    parent_message_id: row.parent_message_id,
    created_at: row.created_at,
    author: {
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        profile_image_url: row.profile_image_url
    }
});

const getMessageByIdQuery = `
SELECT m.message_id,
       m.user_id,
       m.content,
       m.parent_message_id,
       m.created_at,
       u.first_name,
       u.last_name,
       u.email,
       u.profile_image_url
FROM chat_messages m
LEFT JOIN users u ON u.user_id = m.user_id
WHERE m.message_id = $1
`;

const getRecentMessagesQuery = `
SELECT m.message_id,
       m.user_id,
       m.content,
       m.parent_message_id,
       m.created_at,
       u.first_name,
       u.last_name,
       u.email,
       u.profile_image_url
FROM chat_messages m
LEFT JOIN users u ON u.user_id = m.user_id
ORDER BY m.created_at ASC
LIMIT $1
`;

const chatModel = {
    async createMessage(userId, content, parentMessageId = null) {
        const messageId = uuidv4();
        const insertQuery = `
            INSERT INTO chat_messages (message_id, user_id, content, parent_message_id)
            VALUES ($1, $2, $3, $4)
        `;

        await pool.query(insertQuery, [messageId, userId, content, parentMessageId]);
        const { rows } = await pool.query(getMessageByIdQuery, [messageId]);
        return rows[0] ? mapRowToMessage(rows[0]) : null;
    },

    async getMessageById(messageId) {
        const { rows } = await pool.query(getMessageByIdQuery, [messageId]);
        return rows[0] ? mapRowToMessage(rows[0]) : null;
    },

    async getRecentMessages(limit = 200) {
        const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(500, Math.trunc(limit))) : 200;
        const { rows } = await pool.query(getRecentMessagesQuery, [safeLimit]);
        return rows.map(mapRowToMessage);
    }
};

module.exports = { chatModel };
