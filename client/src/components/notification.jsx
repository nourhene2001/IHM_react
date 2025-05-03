import React, { useState, useEffect, useRef, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faTimesCircle, faEnvelope, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function Notifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user?.token) {
          setError('Please log in to view notifications. 😔');
          return;
        }
  
        const response = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
  
        // Ensure the response is an array before setting it
        const notificationsData = Array.isArray(response.data) ? response.data : [];
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);
        setError('');
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(
          error.response?.status === 401
            ? 'Unauthorized: Please log in again. 😿'
            : 'Failed to fetch notifications. Please try again. 😢'
        );
      }
    };
  
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      if (!user?.token) {
        setError('Please log in to mark notifications as read. 😔');
        return;
      }

      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setNotifications(
        notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read. 😢');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application': return faCheckCircle;
      case 'rejection': return faTimesCircle;
      case 'message': return faEnvelope;
      default: return faBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application': return 'text-green-600';
      case 'acceptance': return 'text-green-600';
      case 'rejection': return 'text-red-600';
      case 'message': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="relative inline-block" ref={notificationRef}>
      <button
        className="bg-neutral-200 text-neutral-800 relative rounded-lg p-2 min-w-[2.5rem] h-[2.5rem] hover:bg-neutral-300 transition focus:outline-none focus:ring-2 focus:ring-green-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} size="1x" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10 overflow-hidden"
          >
            <div className="p-3 border-b border-neutral-200">
              <h4 className="font-semibold text-neutral-900 tracking-tight">Notifications 🔔</h4>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 flex items-start gap-2">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 mt-0.5" />
                <p className="text-sm font-light tracking-wide">{error}</p>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && !error ? (
                <div className="p-4 text-center text-neutral-500 font-light tracking-wide">
                  No notifications yet 📭
                </div>
              ) : (
                notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer ${
                      !notification.read ? 'bg-green-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex">
                      <div className={`mr-3 ${getNotificationColor(notification.type)}`}>
                        <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-800 font-medium tracking-tight">
                          {notification.title}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 font-light tracking-wide">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1 font-light tracking-wide">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-green-600 rounded-full self-start mt-2"></div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-neutral-200">
              <button
                className="w-full text-center text-sm text-green-600 hover:text-green-700 p-1 font-medium transition focus:outline-none focus:ring-2 focus:ring-green-500"
                onClick={() => {
                  // Mark all as read logic (optional, to be implemented)
                }}
              >
                Mark all as read ✅
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Notifications;