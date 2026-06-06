import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FiSend, FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { chatAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, EmptyState } from "../components/UI";

export default function Chat() {
    const { conversationId } = useParams();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConvo, setActiveConvo] = useState(conversationId || null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConvo) fetchMessages(activeConvo);
    }, [activeConvo]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const { data } = await chatAPI.getConversations();
            setConversations(data.data || []);
        } catch { setConversations([]); }
        setLoading(false);
    };

    const fetchMessages = async (convoId) => {
        try {
            const { data } = await chatAPI.getMessages(convoId);
            setMessages(data.data?.messages || []);
        } catch { setMessages([]); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConvo) return;
        setSending(true);
        try {
            const { data } = await chatAPI.sendMessage(activeConvo, { content: newMessage.trim() });
            setMessages((prev) => [...prev, data.data]);
            setNewMessage("");
            fetchConversations();
        } catch { }
        setSending(false);
    };

    const getOtherParticipant = (convo) => {
        return convo.participants?.find((p) => p._id !== user?._id) || convo.participants?.[0];
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
                <FiMessageCircle className="text-gold-500" /> Messages
            </h1>

            <div className="card overflow-hidden !shadow-lg border border-gold-100/30" style={{ height: "70vh" }}>
                <div className="flex h-full">
                    {/* Conversation List */}
                    <div className={`w-full sm:w-80 border-r border-gray-100 flex flex-col ${activeConvo ? "hidden sm:flex" : "flex"}`}>
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800">Conversations</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="p-6 text-center text-gray-400 text-sm">No conversations yet</div>
                            ) : (
                                conversations.map((convo) => {
                                    const other = getOtherParticipant(convo);
                                    return (
                                        <button
                                            key={convo._id}
                                            onClick={() => setActiveConvo(convo._id)}
                                            className={`w-full p-4 flex items-center gap-3 hover:bg-gold-50 transition-colors border-b border-gray-50 text-left ${activeConvo === convo._id ? "bg-gold-50" : ""}`}
                                        >
                                            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {other?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 truncate">{other?.name || "User"}</p>
                                                <p className="text-xs text-gray-400 truncate">{convo.lastMessage || "No messages yet"}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className={`flex-1 flex flex-col ${activeConvo ? "flex" : "hidden sm:flex"}`}>
                        {!activeConvo ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <FiMessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                                    <p>Select a conversation to start chatting</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                                    <button onClick={() => setActiveConvo(null)} className="sm:hidden text-gray-500">
                                        <FiArrowLeft size={20} />
                                    </button>
                                    <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {getOtherParticipant(conversations.find((c) => c._id === activeConvo))?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <span className="font-semibold text-gray-800">
                                        {getOtherParticipant(conversations.find((c) => c._id === activeConvo))?.name || "User"}
                                    </span>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                                    {messages.map((msg) => {
                                        const isMine = msg.sender?._id === user?._id;
                                        return (
                                            <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMine ? "bg-gold-500 text-white rounded-br-md" : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm"}`}>
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 ${isMine ? "text-gold-200" : "text-gray-400"}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-3">
                                    <input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="input-field flex-1 !py-2.5"
                                    />
                                    <button type="submit" disabled={sending || !newMessage.trim()} className="btn-primary !py-2.5 !px-5">
                                        <FiSend size={18} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
