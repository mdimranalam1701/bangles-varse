import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSend, FiArrowLeft, FiMessageCircle, FiSearch } from "react-icons/fi";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { chatAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/UI";
import OwnerLayout from "../components/OwnerLayout";

let socket = null;

export default function Chat() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConvo, setActiveConvo] = useState(conversationId || null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef(null);

    const isOwner = user?.role === "owner";
    const isAdmin = user?.role === "admin";
    const accent = isOwner
        ? { bg: "bg-purple-50", text: "text-purple-700", btn: "bg-purple-600 hover:bg-purple-700", bubble: "bg-purple-600 text-white rounded-br-md", time: "text-purple-200", active: "bg-purple-50 border-l-2 border-l-purple-500", avatar: "from-purple-500 to-purple-700" }
        : { bg: "bg-amber-50", text: "text-amber-700", btn: "bg-amber-600 hover:bg-amber-700", bubble: "bg-amber-600 text-white rounded-br-md", time: "text-amber-200", active: "bg-amber-50 border-l-2 border-l-amber-500", avatar: "from-amber-400 to-amber-600" };

    // Socket.IO connection
    useEffect(() => {
        if (!user) return;
        socket = io(window.location.origin, { transports: ["websocket", "polling"] });
        socket.on("receiveMessage", (msg) => {
            if (msg.conversation === activeConvo) {
                setMessages((prev) => [...prev, msg]);
            }
            fetchConversations();
        });
        return () => { socket?.disconnect(); socket = null; };
    }, [user, activeConvo]);

    useEffect(() => { fetchConversations(); }, []);
    useEffect(() => {
        if (activeConvo) {
            fetchMessages(activeConvo);
            socket?.emit("joinConversation", activeConvo);
        }
    }, [activeConvo]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const fetchConversations = async () => {
        try { const { data } = await chatAPI.getConversations(); setConversations(data.data || []); } catch { setConversations([]); }
        setLoading(false);
    };

    const fetchMessages = async (convoId) => {
        try { const { data } = await chatAPI.getMessages(convoId); setMessages(data.data?.messages || []); } catch { setMessages([]); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConvo) return;
        setSending(true);
        try {
            const { data } = await chatAPI.sendMessage(activeConvo, { content: newMessage.trim() });
            setMessages((prev) => [...prev, data.data]);
            socket?.emit("sendMessage", { conversationId: activeConvo, message: data.data });
            setNewMessage("");
            fetchConversations();
        } catch { toast.error("Failed to send"); }
        setSending(false);
    };

    const getOther = (convo) => convo.participants?.find((p) => p._id !== user?._id) || convo.participants?.[0];

    const filteredConvos = searchQuery
        ? conversations.filter(c => { const o = getOther(c); return o?.name?.toLowerCase().includes(searchQuery.toLowerCase()); })
        : conversations;

    if (loading) return <LoadingSpinner />;

    const content = (
        <div className="max-w-5xl mx-auto h-[calc(100vh-120px)]">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex shadow-sm">
                {/* Conversation List */}
                <div className={`w-full sm:w-80 border-r border-gray-100 flex flex-col ${activeConvo ? "hidden sm:flex" : "flex"}`}>
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-3">Messages</h3>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 border border-gray-200" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredConvos.length === 0 ? (
                            <div className="p-6 text-center">
                                <FiMessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                                <p className="text-gray-400 text-sm">{searchQuery ? "No matches" : "No conversations yet"}</p>
                            </div>
                        ) : filteredConvos.map((convo) => {
                            const other = getOther(convo);
                            const isActive = activeConvo === convo._id;
                            const unread = convo.unreadCount?.[user?._id] || 0;
                            return (
                                <button key={convo._id} onClick={() => setActiveConvo(convo._id)}
                                    className={`w-full p-4 flex items-center gap-3 transition-colors border-b border-gray-50 text-left ${isActive ? accent.active : "hover:bg-gray-50"}`}>
                                    <div className={`w-10 h-10 bg-gradient-to-br ${accent.avatar} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                                        {other?.profilePicture ? <img src={other.profilePicture} alt="" className="w-full h-full object-cover rounded-full" /> : other?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`font-medium truncate ${unread > 0 ? "text-gray-900" : "text-gray-700"}`}>{other?.name || "User"}</p>
                                            {unread > 0 && <span className={`w-5 h-5 ${accent.btn} text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0`}>{unread}</span>}
                                        </div>
                                        <p className={`text-xs truncate mt-0.5 ${unread > 0 ? "text-gray-600 font-medium" : "text-gray-400"}`}>{convo.lastMessage || "No messages yet"}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Message Area */}
                <div className={`flex-1 flex flex-col ${activeConvo ? "flex" : "hidden sm:flex"}`}>
                    {!activeConvo ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${accent.avatar} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                                    <FiMessageCircle size={28} className="text-white" />
                                </div>
                                <p className="text-gray-500 font-medium">Select a conversation</p>
                                <p className="text-gray-400 text-sm mt-1">Choose from the list to start chatting</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                                <button onClick={() => setActiveConvo(null)} className="sm:hidden text-gray-500 hover:text-gray-700"><FiArrowLeft size={20} /></button>
                                <div className={`w-9 h-9 bg-gradient-to-br ${accent.avatar} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                                    {(() => { const o = getOther(conversations.find((c) => c._id === activeConvo)); return o?.profilePicture ? <img src={o.profilePicture} alt="" className="w-full h-full object-cover rounded-full" /> : o?.name?.[0]?.toUpperCase() || "U"; })()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{getOther(conversations.find((c) => c._id === activeConvo))?.name || "User"}</p>
                                    <p className="text-[11px] text-gray-400">{getOther(conversations.find((c) => c._id === activeConvo))?.role === "owner" ? "Shop Owner" : "Customer"}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                                {messages.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isMine = msg.sender?._id === user?._id;
                                    return (
                                        <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMine ? accent.bubble : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm"}`}>
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${isMine ? accent.time : "text-gray-400"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 border border-gray-200" />
                                <button type="submit" disabled={sending || !newMessage.trim()}
                                    className={`${accent.btn} text-white p-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg`}>
                                    <FiSend size={18} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    if (isOwner) return <OwnerLayout>{content}</OwnerLayout>;
    if (isAdmin) return content; // Admin shouldn't normally reach here
    return <div className="px-4 py-8">{content}</div>;
}
