import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

function Messages({ applicationId }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/jobs/applications/${applicationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/jobs/applications/${applicationId}/messages/mark-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [applicationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/jobs/applications/${applicationId}/message`,
        { content: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getMessageStatus = (message) => {
    return message.isRead ? '👀 Seen' : '✔️ Sent';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col">
      <h4 className="mb-4 text-lg font-semibold text-gray-800">💬 Messages</h4>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 p-3 bg-gray-50 rounded">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-xl" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 h-full flex items-center justify-center">
            <p>No messages yet. Start the conversation! ✉️</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-md ${
                    isCurrentUser
                      ? 'ml-auto bg-blue-500 text-white rounded-br-none'
                      : 'mr-auto bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="font-semibold mb-1">
                    {isCurrentUser ? '🧍‍♂️ You' : `🧑‍💼 ${message.sender?.name || 'Unknown'}`}
                  </div>
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  <div className="text-xs text-right mt-1 opacity-70">
                    {new Date(message.sentAt).toLocaleTimeString()} — {isCurrentUser && getMessageStatus(message)}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          disabled={sending}
          maxLength={1000}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          disabled={sending || !newMessage.trim()}
          aria-label="Send message"
        >
          {sending ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} />
          )}
        </button>
      </form>
    </div>
  );
}

export default Messages;
