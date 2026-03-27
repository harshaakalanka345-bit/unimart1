import { useState, useEffect, useRef } from "react";
import { useAuth, API } from "../../context/AuthContext";
import "./Messages.css";

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await API.get("/messages");
      setConversations(data);
    } catch {} finally { setLoading(false); }
  };

  const openConversation = async (conv) => {
    setActive(conv);
    try {
      const data = await API.get(`/messages/${conv._id}`);
      setMessages(data.messages || []);
      setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unread: 0 } : c));
    } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !active || sending) return;
    setSending(true);
    const optimistic = { _id: Date.now(), content: input, sender: { _id: user._id }, createdAt: new Date(), readBy: [user._id] };
    setMessages(prev => [...prev, optimistic]);
    setInput("");
    try {
      await API.post(`/messages/${active._id}`, { content: input });
      setConversations(prev => prev.map(c => c._id === active._id ? { ...c, lastMessage: input } : c));
    } catch { setMessages(prev => prev.filter(m => m._id !== optimistic._id)); }
    finally { setSending(false); }
  };

  const getOtherParticipant = (conv) => conv.participants?.find(p => p._id !== user._id);

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString();
  };

  return (
    <div className="messages-page">
      <div className="container">
        <div className="messages-layout">
          {/* Conversations list */}
          <div className="conv-list">
            <div className="conv-list__header">
              <h2>Messages</h2>
              <span className="badge badge-blue">{conversations.length}</span>
            </div>

            {loading ? (
              <div className="conv-loading">
                {Array(4).fill(0).map((_,i) => (
                  <div key={i} className="conv-item-skeleton">
                    <div className="skeleton" style={{width:44,height:44,borderRadius:"50%",flexShrink:0}} />
                    <div style={{flex:1}}>
                      <div className="skeleton" style={{height:13,marginBottom:7}} />
                      <div className="skeleton" style={{height:11,width:"70%"}} />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="conv-empty">
                <span>💬</span>
                <p>No conversations yet</p>
                <small>Start chatting by messaging a seller</small>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherParticipant(conv);
                const isActive = active?._id === conv._id;
                return (
                  <div key={conv._id} className={`conv-item ${isActive ? "active" : ""}`} onClick={() => openConversation(conv)}>
                    <div className="conv-avatar">
                      {other?.profilePicture
                        ? <img src={other.profilePicture} alt="" />
                        : <span>{other?.name?.charAt(0)}</span>}
                    </div>
                    <div className="conv-info">
                      <div className="conv-info__top">
                        <span className="conv-name">{other?.name}</span>
                        <span className="conv-time">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <p className="conv-preview">
                        {conv.product && <span className="conv-product-tag">{conv.product.title?.slice(0,20)}...</span>}
                      </p>
                      <p className="conv-last">{conv.lastMessage || "No messages yet"}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat window */}
          <div className="chat-window">
            {!active ? (
              <div className="chat-empty">
                <span className="chat-empty__icon">💬</span>
                <h3>Select a conversation</h3>
                <p>Choose a chat from the list to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="chat-header">
                  <div className="chat-header__user">
                    <div className="chat-avatar">
                      {getOtherParticipant(active)?.profilePicture
                        ? <img src={getOtherParticipant(active).profilePicture} alt="" />
                        : <span>{getOtherParticipant(active)?.name?.charAt(0)}</span>}
                    </div>
                    <div>
                      <p className="chat-header__name">{getOtherParticipant(active)?.name}</p>
                      <p className="chat-header__status">Online</p>
                    </div>
                  </div>
                  {active.product && (
                    <div className="chat-product-info">
                      <div className="chat-product-img">
                        {active.product.images?.[0]
                          ? <img src={active.product.images[0]} alt="" />
                          : <span>📦</span>}
                      </div>
                      <div>
                        <p className="chat-product-title">{active.product.title}</p>
                        <p className="chat-product-price">Rs. {active.product.price?.toLocaleString()}</p>
                      </div>
                      <span className={`badge ${active.product.status === "Available" ? "badge-green" : active.product.status === "Reserved" ? "badge-orange" : "badge-gray"}`}>
                        {active.product.status}
                      </span>
                    </div>
                  )}
                  <div className="chat-header__actions">
                    <button className="btn btn-ghost btn-sm" title="Report conversation">🚩 Report</button>
                  </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div className="chat-start-msg">
                      <span>👋</span>
                      <p>Start the conversation! Ask about the item or make an offer.</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => {
                    const isMe = (msg.sender?._id || msg.sender) === user._id;
                    return (
                      <div key={msg._id || idx} className={`msg-wrap ${isMe ? "msg-wrap--me" : "msg-wrap--them"}`}>
                        {!isMe && (
                          <div className="msg-avatar">
                            {getOtherParticipant(active)?.profilePicture
                              ? <img src={getOtherParticipant(active).profilePicture} alt="" />
                              : <span>{getOtherParticipant(active)?.name?.charAt(0)}</span>}
                          </div>
                        )}
                        <div className={`msg-bubble ${isMe ? "msg-bubble--me" : "msg-bubble--them"}`}>
                          <p>{msg.content}</p>
                          <span className="msg-time">{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-bar" onSubmit={sendMessage}>
                  <button type="button" className="chat-attach-btn" title="Attach file">📎</button>
                  <input
                    type="text" className="chat-input" placeholder="Type a message..."
                    value={input} onChange={e => setInput(e.target.value)}
                    disabled={!active.isActive}
                  />
                  <button type="submit" className="chat-send-btn btn btn-primary" disabled={!input.trim() || sending}>
                    {sending ? "..." : "Send ➤"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
