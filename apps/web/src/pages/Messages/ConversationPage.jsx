import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { ArrowLeft, Send, Package } from "lucide-react";
import { toast } from "sonner";

export default function ConversationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversation();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const api = new APICore();
      const response = await api.get(`/api/conversations/${id}`);
      setConversation(response.data.conversation);
      setMessages(response.data.messages || []);
      setUserRole(response.data.userRole);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast.error(error.message || "Failed to load conversation");
      if (error.response?.status === 403 || error.response?.status === 404) {
        setTimeout(() => navigate("/messages"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const api = new APICore();
      await api.post(`/api/conversations/${id}/messages`, {
        content: newMessage.trim(),
      });
      setNewMessage("");
      // Refresh messages
      await fetchConversation();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading conversation...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Conversation Not Found</h2>
            <p className="text-slate-600">The conversation you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const otherParticipant = userRole === "client"
    ? {
        firstName: conversation.freelancer_first_name,
        lastName: conversation.freelancer_last_name,
        userId: conversation.freelancer_user_id,
      }
    : {
        firstName: conversation.client_first_name,
        lastName: conversation.client_last_name,
        userId: conversation.client_user_id,
      };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/messages")}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Messages
          </button>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {otherParticipant.firstName?.[0]}{otherParticipant.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {otherParticipant.firstName} {otherParticipant.lastName}
                  </h2>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    {conversation.service_title} - {conversation.package_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/orders/${conversation.order_id}`)}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                View Order
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, idx) => {
                const isOwnMessage = parseInt(message.sender_user_id) === parseInt(otherParticipant.userId) ? false : true;
                return (
                  <div
                    key={idx}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-indigo-200" : "text-slate-500"
                        }`}
                      >
                        {new Date(message.sent_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
