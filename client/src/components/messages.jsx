import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Messages({ applicationId, userRole, candidateId, recruiterId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch messages for the application
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view messages');
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/jobs/applications/${applicationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.message || 'Error fetching messages');
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [applicationId]);

  // Scroll to the bottom of the messages when new messages are loaded
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/jobs/applications/${applicationId}/message`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...messages, response.data.data]);
      setNewMessage('');
      setError('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Error sending message');
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Messages</h3>

      {error && (
        <p className="text-red-500 text-sm mb-2 bg-red-100 p-2 rounded">{error}</p>
      )}

      {/* Messages Display */}
      <div className="max-h-64 overflow-y-auto mb-4 p-2 border border-gray-200 rounded-lg">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => {
            const isSentByUser =
              (userRole === 'candidate' && message.senderId === candidateId) ||
              (userRole === 'recruiter' && message.senderId === recruiterId);
            return (
              <div
                key={message.id}
                className={`mb-2 flex ${
                  isSentByUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    isSentByUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {message.sender.name} • {new Date(message.sentAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Messages;