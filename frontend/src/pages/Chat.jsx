import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { chatAPI, API_ORIGIN } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/UI";

export default function Chat() {
    const { conversationId } = useParams();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(conversationId || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const socketRef = useRef(null);
    const endRef = useRef(null);

    useEffect(() => {
        const socket = io(API_ORIGIN || window.location.origin, {
            auth: { token: localStorage.getItem("token") },
            transports: ["websocket", "polling"],
        });
        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
        });
        socketRef.current = socket;

        chatAPI
            .getConversations()
            .then(({ data }) => setConversations(data.data || []))
            .catch(() => setConversations([]))
            .finally(() => setLoading(false));

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (!activeConvo) return;
        socketRef.current?.emit("joinConversation", activeConvo);
        chatAPI
            .getMessages(activeConvo)
            .then(({ data }) => setMessages(data.data?.messages || []))
            .catch(() => setMessages([]));
    }, [activeConvo]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConvo || sending) return;
        setSending(true);
        try {
            const { data } = await chatAPI.sendMessage(activeConvo, { content: newMessage.trim() });
            setMessages((prev) => [...prev, data.data]);
            socketRef.current?.emit("sendMessage", { conversationId: activeConvo, message: data.data });
            setNewMessage("");
        } catch {
            toast.error("Failed to send message");
        }
        setSending(false);
    };

    const getOther = (c) => c?.participants?.find((p) => p._id !== (user?._id || user?.id));

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-ink mb-5">Messages with Shops</h1>
            <div className="card flex h-[540px]">
                <div className={`w-full sm:w-72 border-r border-parchment overflow-y-auto ${activeConvo ? "hidden sm:block" : "block"}`}>
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-umber text-sm">
                            <MessageCircle size={28} className="mx-auto mb-2 opacity-40" />
                            No conversations yet.
                        </div>
                    ) : (
                        conversations.map((c) => {
                            const other = getOther(c);
                            return (
                                <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => setActiveConvo(c._id)}
                                    className={`w-full p-4 text-left border-b border-parchment/60 hover:bg-linen transition-colors ${
                                        activeConvo === c._id ? "bg-sindoor-50/70" : ""
                                    }`}
                                >
                                    <p className="font-semibold text-sm text-ink">{other?.name || "Shop"}</p>
                                    <p className="text-xs text-umber truncate">{c.lastMessage || "Start chatting"}</p>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className={`flex-1 flex flex-col ${!activeConvo ? "hidden sm:flex" : "flex"}`}>
                    {!activeConvo ? (
                        <div className="flex-1 flex items-center justify-center text-umber text-sm">
                            Select a conversation to view messages
                        </div>
                    ) : (
                        <>
                            <div className="p-3 border-b border-parchment flex items-center gap-2 bg-white">
                                <button type="button" onClick={() => setActiveConvo(null)} className="sm:hidden p-1 text-umber">
                                    <ArrowLeft size={18} />
                                </button>
                                <span className="font-semibold text-sm text-ink">
                                    {getOther(conversations.find((c) => c._id === activeConvo))?.name || "Conversation"}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-ivory">
                                {messages.map((m) => {
                                    const mine = m.sender?._id === (user?._id || user?.id) || m.sender === (user?._id || user?.id);
                                    return (
                                        <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${mine ? "bg-sindoor-600 text-white" : "bg-white border border-parchment text-ink"}`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={endRef} />
                            </div>

                            <form onSubmit={handleSend} className="p-3 border-t border-parchment flex gap-2 bg-white">
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="input-field !min-h-[40px] !py-2 text-sm flex-1"
                                />
                                <button type="submit" disabled={sending} className="btn-primary !py-2 !px-4 !min-h-[40px]">
                                    <Send size={15} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
