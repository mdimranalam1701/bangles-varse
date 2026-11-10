import * as chatService from "./chat.service.js";

export const startConversation = async (req, res) => {
    try {
        const { ownerId, productId } = req.body;
        const conversation = await chatService.getOrCreateConversation(req.user._id, ownerId, productId);
        res.json({ success: true, data: conversation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getConversations = async (req, res) => {
    try {
        const conversations = await chatService.getConversations(req.user._id);
        res.json({ success: true, data: conversations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const result = await chatService.getMessages(req.params.conversationId, req.user._id, Number(page), Number(limit));
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const message = await chatService.sendMessage(req.params.conversationId, req.user._id, content);
        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await chatService.getUnreadCount(req.user._id);
        res.json({ success: true, data: { count } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
