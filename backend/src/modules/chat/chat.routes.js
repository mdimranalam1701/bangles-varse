import express from "express";
import {
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
    getUnreadCount,
} from "./chat.controller.js";
import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuth);

router.post("/conversation", startConversation);
router.get("/conversations", getConversations);
router.get("/unread", getUnreadCount);
router.get("/:conversationId/messages", getMessages);
router.post("/:conversationId/messages", sendMessage);

export default router;
