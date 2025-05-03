import React, { useState, useEffect, useRef, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faCheckCircle, 
  faTimesCircle, 
  faEnvelope, 
  faExclamationCircle,
  faCircleNotch,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function Notifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user?.token) {
        throw new Error('Please log in to view notifications');
      }

      const response = await axios.get('http://localhost:5000/api/jobs/notifications', {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid notifications data format');
      }

      // Process notifications to match expected format
      const processedNotifications = response.data.map(notification => {
        // Determine notification type based on message content
        let type = 'general';
        if (notification.message.includes('applied')) type = 'application';
        if (notification.message.includes('accepted')) type = 'acceptance';
        if (notification.message.includes('rejected')) type = 'rejection';
        if (notification.message.includes('message')) type = 'message';

        return {
          id: notification.id,
          type,
          title: type === 'application' ? 'New Application' : 
                type === 'acceptance' ? 'Application Accepted' :
                type === 'rejection' ? 'Application Rejected' :
                type === 'message' ? 'New Message' : 'Notification',
          message: notification.message,
          read: notification.isRead,
          createdAt: notification.createdAt,
          applicationId: notification.applicationId,
          jobId: notification.jobId
        };
      });

      setNotifications(processedNotifications);
      setUnreadCount(processedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Notification fetch error:', error);
      setError(
        error.response?.status === 401 ? 'Session expired. Please log in again.' :
        error.response?.status === 404 ? 'No notifications found' :
        error.message || 'Failed to load notifications. Please try again later.'
      );
      
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
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
        throw new Error('Authentication required');
      }

      await axios.put(
        `http://localhost:5000/api/jobs/notifications/${id}/read`, 
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setNotifications(prev => 
        prev.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
      setError('Failed to update notification status');
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user?.token) {
        throw new Error('Authentication required');
      }

      await axios.put(
        'http://localhost:5000/api/jobs/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
      setError('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application': return faCheckCircle;
      case 'acceptance': return faCheckCircle;
      case 'rejection': return faTimesCircle;
      case 'message': return faEnvelope;
      default: return faInfoCircle;
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
            className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-neutral-200">
              <h4 className="font-semibold text-neutral-900 tracking-tight">
                Notifications {unreadCount > 0 && `(${unreadCount} new)`}
              </h4>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 flex items-start gap-2">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 mt-0.5" />
                <p className="text-sm font-light tracking-wide">{error}</p>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 flex justify-center">
                  <FontAwesomeIcon icon={faCircleNotch} spin className="text-blue-500 text-xl" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-neutral-500 font-light tracking-wide">
                  {error ? 'No notifications available' : 'No notifications yet'}
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
                className={`w-full text-center text-sm p-1 font-medium transition focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  unreadCount === 0 
                    ? 'text-neutral-400 cursor-not-allowed' 
                    : 'text-green-600 hover:text-green-700'
                }`}
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Notifications;