import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import NotificationList from './NotificationList';

// Socket bağlantısını component dışında oluştur
const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  autoConnect: false,
  withCredentials: true
});

const Sidebar = ({ user, onLogout, onSelectMenu, onSelectFriend, activeChats }) => {
  // Profil bilgileri için local state
  const [profile, setProfile] = useState({
    displayName: user.username,
    profilePicture: '/default_avatar.png'
  });
  
  // Bildirim sayısı için state
  const [notificationCount, setNotificationCount] = useState(0);

  const [closingChatIds, setClosingChatIds] = useState([]);
  const [visibleChats, setVisibleChats] = useState(activeChats);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.id) return;
      try {
        const response = await axios.get(`http://127.0.0.5:5000/user/get_profile/${user.id}`);
        setProfile({
          displayName: response.data.display_name || response.data.username,
          profilePicture: response.data.profile_picture
            ? `http://127.0.0.5:5000/pp/${response.data.profile_picture}`
            : '/default_avatar.png'
        });
      } catch (err) {
        setProfile({
          displayName: user.username,
          profilePicture: '/default_avatar.png'
        });
      }
    };
    fetchProfile();
  }, [user.id, user.username]);

  useEffect(() => {
    if (!user.id) return;

    // Socket bağlantısını başlat
    if (!socket.connected) {
      socket.connect();
    }

    // Socket event listener'ları
    socket.on("connect", () => {
      socket.emit("join", { user_id: user.id });
    });

    // Bildirim sayısını dinle
    socket.on("notification_count", (data) => {
      setNotificationCount(data.count);
    });

    // İlk yüklemede bildirim sayısını al
    socket.emit("get_notifications", { user_id: user.id });

    // Cleanup
    return () => {
      socket.off("notification_count");
      socket.off("connect");
    };
  }, [user.id]);

  useEffect(() => {
    setVisibleChats(activeChats);
  }, [activeChats]);

  const handleCloseChat = async (friendId) => {
    setClosingChatIds(prev => [...prev, friendId]);
    try {
      await axios.get(`http://localhost:5000/message/close_chat/${user.id}/${friendId}`);
      setVisibleChats(prev => prev.filter(chat => chat.friend_id !== friendId));
    } catch (e) {
      // Hata yönetimi
    } finally {
      setClosingChatIds(prev => prev.filter(id => id !== friendId));
    }
  };

  const handleNotificationClick = () => {
    // Custom event tetikle
    const event = new CustomEvent('openNotifications');
    window.dispatchEvent(event);
  };

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      backgroundColor: '#181818',
      color: '#ccc',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #2c2c2c',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      {/* Üst Kısım */}
      <div style={{
        padding: '20px 10px',
        borderBottom: '1px solid #2c2c2c'
      }}>
        {/* Kullanıcı adı */}
        <h3 style={{ color: '#eee', fontSize: '18px', marginBottom: '20px' }}>
          👤 {user.username}
        </h3>

        {/* Butonlar container */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {/* Arkadaşlar butonu */}
          <div 
            onClick={() => onSelectMenu('friends')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#252525',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#ccc',
              fontWeight: 'bold',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Arkadaşlar
          </div>

          {/* Bildirimler butonu */}
          <div 
            onClick={handleNotificationClick}
            style={{
              padding: '12px',
              backgroundColor: '#252525',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#ccc',
              fontWeight: 'bold',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              position: 'relative',
              minWidth: '45px'
            }}
          >
            🔔
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#ff4444',
                color: 'white',
                borderRadius: '50%',
                minWidth: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px'
              }}>
                {notificationCount}
              </span>
            )}
          </div>
        </div>

        {/* Sohbetler başlığı */}
        <h4 style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>Sohbetler</h4>
      </div>

      {/* Orta Kısım - Kaydırılabilir Sohbet Listesi */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px'
      }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {visibleChats
            .filter(chat => Number(chat.isopen) === 1)
            .map((chat, index) => (
              <li 
                key={index}
                style={{
                  padding: '8px',
                  color: '#ccc',
                  transition: 'background-color 0.2s',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  position: 'relative'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#252525'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Sohbeti açan alan */}
                <div
                  onClick={() => onSelectFriend({
                    id: chat.friend_id,
                    username: chat.friend_username,
                    profile_picture: chat.friend_profile_picture
                  })}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={chat.friend_profile_picture ? `http://localhost:5000/pp/${chat.friend_profile_picture}` : '/default_avatar.png'}
                      alt="Profil"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginRight: '8px',
                        border: '2px solid #252525',
                        background: '#222'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500, color: '#fff', display: 'block' }}>{chat.friend_username || chat.friend_id}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#bbb', fontSize: '13px', marginTop: '4px', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {chat.last_message_content && chat.last_message_content.length > 30
                            ? chat.last_message_content.slice(0, 30) + '...'
                            : chat.last_message_content || ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Kapatma butonu */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleCloseChat(chat.friend_id);
                  }}
                  disabled={closingChatIds.includes(chat.friend_id)}
                  style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: 'none',
                    color: '#ff5555',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0 6px',
                    borderRadius: '50%',
                    transition: 'background 0.2s',
                    outline: 'none'
                  }}
                  title="Sohbeti kapat"
                >
                  ×
                </button>
              </li>
            ))}
        </ul>
      </div>

      {/* Alt Kısım */}
      <div style={{
        padding: '20px 10px',
        borderTop: '1px solid #2c2c2c',
        backgroundColor: '#181818'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mini Profil Alanı */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            background: '#232323',
            border: '1px solid #292929',
            borderRadius: '10px',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
            padding: '4px 8px',
            minHeight: '40px',
            height: '40px',
            maxHeight: '40px'
          }}>
            <div style={{ position: 'relative', width: '32px', height: '32px', marginRight: '8px' }}>
              <img
                src={profile.profilePicture}
                alt="Profil"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #252525',
                  background: '#222'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '-4px',
                  bottom: '-4px',
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  background: '#4caf50',
                  border: '2px solid #181818',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1, gap: '0' }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '13px', lineHeight: 1 }}>{profile.displayName}</span>
              <span style={{ color: '#b3b3b3', fontSize: '11px', fontWeight: 500, marginTop: '1px', lineHeight: 1 }}>
                Çevrimiçi
              </span>
            </div>
          </div>
          {/* Ayarlar (çark) butonu */}
          <button 
            onClick={() => onSelectMenu('settings')}
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              backgroundColor: '#252525',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}
          >
            <span style={{ fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙️</span>
          </button>
        </div>
      </div>

      {/* Bildirimler Modalı */}
      {showNotifications && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#252525',
            borderRadius: '10px',
            padding: '20px',
            width: '400px',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #333',
              paddingBottom: '10px'
            }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Bildirimler</h3>
              <button
                onClick={() => setShowNotifications(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ×
              </button>
            </div>
            <NotificationList userId={user.id} onClose={() => setShowNotifications(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;