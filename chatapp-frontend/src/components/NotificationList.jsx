import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationList = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/notification/get_notifications/${userId}`);
      if (response.data.status === 'success') {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await axios.post(`http://localhost:5000/notification/mark_read/${notificationId}/${userId}`);
      if (response.data.status === 'success') {
        // Bildirimi yerel state'de güncelle
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata:', error);
    }
  };

  const getNotificationContent = (notification) => {
    switch (notification.notification_type) {
      case 'message':
        return {
          title: `${notification.sender_username} size mesaj gönderdi`,
          content: notification.content
        };
      case 'friend_request':
        return {
          title: `${notification.sender_username} size arkadaşlık isteği gönderdi`,
          content: 'Arkadaşlık isteğini kabul etmek için tıklayın'
        };
      default:
        return {
          title: 'Bildirim',
          content: notification.content
        };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#ccc' }}>
        Yükleniyor...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#ccc' }}>
        Henüz bildirim yok
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {notifications.map((notification) => {
        const { title, content } = getNotificationContent(notification);
        return (
          <div
            key={notification.id}
            style={{
              padding: '12px',
              backgroundColor: notification.is_read ? '#2a2a2a' : '#333',
              borderRadius: '8px',
              borderLeft: `4px solid ${notification.is_read ? '#666' : '#4CAF50'}`,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = notification.is_read ? '#333' : '#3a3a3a'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = notification.is_read ? '#2a2a2a' : '#333'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: '#fff', 
                  fontWeight: notification.is_read ? 'normal' : 'bold',
                  marginBottom: '4px'
                }}>
                  {title}
                </div>
                <div style={{ 
                  color: '#ccc',
                  fontSize: '13px',
                  marginBottom: '4px'
                }}>
                  {content}
                </div>
                <div style={{ 
                  color: '#999', 
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{new Date(notification.created_at).toLocaleString('tr-TR')}</span>
                  {!notification.is_read && (
                    <span style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '11px'
                    }}>
                      Yeni
                    </span>
                  )}
                </div>
              </div>
              {notification.sender_profile_picture && (
                <img
                  src={`http://localhost:5000/pp/${notification.sender_profile_picture}`}
                  alt="Gönderen"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    marginLeft: '10px'
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationList; 