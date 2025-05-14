import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

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

const Sidebar = ({ user, onLogout, onSelectMenu, recentChats, onSelectFriend }) => {
  // Profil bilgileri için local state
  const [profile, setProfile] = useState({
    displayName: user.username,
    profilePicture: '/default_avatar.png'
  });
  
  // Bildirim sayısı için state
  const [notificationCount, setNotificationCount] = useState(0);

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

        {/* Arkadaşlar butonu */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <div 
            onClick={() => onSelectMenu('friends')}
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
              gap: '8px'
            }}
          >
            Arkadaşlar
            {notificationCount > 0 && (
              <span style={{
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
          {recentChats.map((chat, index) => (
            <li 
              key={index}
              onClick={() => onSelectFriend(chat)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                color: '#ccc',
                transition: 'background-color 0.2s',
                borderRadius: '4px',
                marginBottom: '4px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#252525'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {chat.username}
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
    </div>
  );
};

export default Sidebar;
