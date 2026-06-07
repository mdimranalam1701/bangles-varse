import { Conversation, Message } from "./chat.model.js";
import { Notification } from "../notification/notification.model.js";

export const getOrCreateConversation = async (userId, ownerId, productId = null) => {
    let conversation = await Conversation.findOne({
        participants: { $all: [userId, ownerId] },
        ...(productId ? { product: productId } : {}),
    }).populate("participants", "name profilePicture role");

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [userId, ownerId],
            product: productId,
        });
        conversation = await Conversation.findById(conversation._id)
            .populate("participants", "name profilePicture role");
    }

    return conversation;
};

export const getConversations = async (userId) => {
    return await Conversation.find({ participants: userId })
        .populate("participants", "name profilePicture role")
        .populate("product", "name image")
        .sort({ lastMessageAt: -1, updatedAt: -1 });
};

export const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
    const skip = (page - 1) * limit;

    // Mark messages as read
    await Message.updateMany(
        { conversation: conversationId, sender: { $ne: userId }, read: false },
        { read: true }
    );

    // Reset unread count
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
        conversation.unreadCount.set(userId.toString(), 0);
        await conversation.save();
    }

    const messages = await Message.find({ conversation: conversationId })
        .populate("sender", "name profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Message.countDocuments({ conversation: conversationId });
    return { messages: messages.reverse(), total, page, totalPages: Math.ceil(total / limit) };
};

export const sendMessage = async (conversationId, senderId, content) => {
    const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        content,
    });

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
        conversation.lastMessage = content.substring(0, 100);
        conversation.lastMessageAt = new Date();

        // Update unread count for other participants
        conversation.participants.forEach((pId) => {
            if (pId.toString() !== senderId.toString()) {
                const current = conversation.unreadCount.get(pId.toString()) || 0;
                conversation.unreadCount.set(pId.toString(), current + 1);
            }
        });
        await conversation.save();

        // Notify other participants
        const otherParticipants = conversation.participants.filter(
            (p) => p.toString() !== senderId.toString()
        );
        for (const receiverId of otherParticipants) {
            await Notification.create({
                receiver: receiverId,
                title: "New Message 💬",
                message: content.substring(0, 100),
                link: `/chat/${conversationId}`,
                referenceId: conversationId,
            });
        }
    }

    return await Message.findById(message._id).populate("sender", "name profilePicture");
};

export const getUnreadCount = async (userId) => {
    const conversations = await Conversation.find({ participants: userId });
    let total = 0;
    conversations.forEach((c) => {
        total += c.unreadCount.get(userId.toString()) || 0;
    });
    return total;
};
