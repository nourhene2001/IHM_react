import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faTimesCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(
        notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
      case 'application': return 'text-success-500';
      case 'acceptance': return 'text-success-500';
      case 'rejection': return 'text-error-500';
      case 'message': return 'text-primary-500';
      default: return 'text-accent-500';
    }
  };

  return (
    <div className="relative inline-block" ref={notificationRef}>
      <button
        className="btn btn-neutral relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{ padding: 'var(--space-2) var(--space-4)', minWidth: '2.5rem', height: '2.5rem' }} // Fixed size
      >
        <FontAwesomeIcon icon={faBell} size="1x" /> {/* Fixed icon size */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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
            style={{ position: 'absolute', top: '100%', right: 0 }} // Ensure absolute positioning
          >
            <div className="p-3 border-b border-neutral-200">
              <h4 className="font-semibold text-neutral-900">Notifications</h4>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-neutral-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer ${
                      !notification.read ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex">
                      <div className={`mr-3 ${getNotificationColor(notification.type)}`}>
                        <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-800 font-medium">
                          {notification.title}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full self-start mt-2"></div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            <div className="p-2 border-t border-neutral-200">
              <button
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 p-1"
                onClick={() => {
                  // Mark all as read logic (optional, keep as is or implement)
                }}
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