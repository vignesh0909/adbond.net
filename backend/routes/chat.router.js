const express = require('express');
const router = express.Router();
const { chatModel } = require('../models/chat.model.pg');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res, next) => {
    try {
        const limitParam = req.query.limit;
        const limit = limitParam ? parseInt(limitParam, 10) : 200;
        const messages = await chatModel.getRecentMessages(limit);
        res.json({ success: true, messages });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { content, parent_message_id: parentMessageId = null } = req.body;
        const trimmedContent = typeof content === 'string' ? content.trim() : '';

        if (!trimmedContent) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        let parentMessage = null;
        if (parentMessageId) {
            parentMessage = await chatModel.getMessageById(parentMessageId);
            if (!parentMessage) {
                return res.status(404).json({ success: false, message: 'Parent message not found' });
            }
        }

        const newMessage = await chatModel.createMessage(req.user.user_id, trimmedContent, parentMessage ? parentMessage.message_id : null);
        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
