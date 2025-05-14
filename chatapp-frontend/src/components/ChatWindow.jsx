import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import axios from 'axios';
import Profile from './Profile';
import { IoPersonOutline, IoCloseOutline } from "react-icons/io5";

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

const ChatWindow = ({ friend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });

  const messagesEndRef = useRef(null);
  const userId = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    if (!friend?.id) return;

    axios.get(`http://localhost:5000/user/get_profile/${friend.id}`)
      .then(response => {
        const timestamp = new Date().getTime();
        const profileImageUrl = response.data.profile_picture 
          ? `http://localhost:5000/pp/${response.data.profile_picture}?t=${timestamp}`
          : null;
        setFriendProfile({
          ...response.data,
          profile_picture: profileImageUrl
        });
      })
      .catch(error => {
        console.error("Arkadaş profili alınırken hata oluştu:", error);
      });

    axios.get(`http://localhost:5000/user/get_friends_status/${userId}`)
      .then(response => {
        const friendStatus = response.data.friends.find(f => f.id === friend.id);
        if (friendStatus) {
          setIsOnline(friendStatus.is_online);
        }
      })
      .catch(error => {
        console.error("Arkadaş durumu alınırken hata oluştu:", error);
      });
  }, [friend, userId]);

  useEffect(() => {
    if (!userId || !friend?.id) return;

    axios.get(`http://localhost:5000/message/history/${userId}/${friend.id}`)
      .then(response => {
        const fetchedMessages = response.data.messages.map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender: msg.sender_id === userId ? "Sen" : friend.username,
          text: msg.content
        }));
        setMessages(fetchedMessages);
      })
      .catch(error => {
        console.error("Mesaj geçmişi alınırken hata oluştu:", error);
      });
  }, [friend, userId]);

  useEffect(() => {
    if (!userId) return;

    console.log("ChatWindow component yüklendi, userId:", userId);

    // Socket event listener'ları
    const setupSocketListeners = () => {
      socket.on("connect", () => {
        console.log("Socket bağlantısı kuruldu, socket id:", socket.id);
        socket.emit("join", { user_id: userId });
      });

      socket.on("connect_error", (error) => {
        console.error("Socket bağlantı hatası:", error);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket bağlantısı koptu, sebep:", reason);
        if (reason === "io server disconnect") {
          socket.connect();
        }
      });

      socket.on("receive_message", (msg) => {
        setMessages(prev => [...prev, {
          id: msg.id,
          sender_id: parseInt(msg.from),
          sender: parseInt(msg.from) === userId ? "Sen" : friend.username,
          text: msg.message
        }]);
      });

      socket.on("user_status_change", (data) => {
        console.log("Durum değişikliği alındı:", data);
        if (data.user_id === friend?.id) {
          console.log("Arkadaş durumu güncellendi:", data);
          setIsOnline(data.is_online);
        }
      });

      socket.on("online_users", (data) => {
        console.log("Online kullanıcılar alındı:", data);
        const friendStatus = data.friend_statuses.find(f => f.user_id === friend?.id);
        if (friendStatus) {
          console.log("Arkadaş durumu güncellendi (online_users):", friendStatus);
          setIsOnline(friendStatus.is_online);
        }
      });

      // Mesaj silme event'ini dinle
      socket.on("message_deleted", (data) => {
        console.log("Karşıdan mesaj silindi event geldi:", data);
        console.log("Mevcut mesajlar:", messages);
        setMessages(prev => prev.filter(msg => msg.id !== data.message_id));
      });
    };

    // Socket bağlantısını başlat
    if (!socket.connected) {
      console.log("Socket bağlantısı başlatılıyor...");
      socket.connect();
    }

    // Event listener'ları kur
    setupSocketListeners();

    // Cleanup
    return () => {
      console.log("ChatWindow component unmount oluyor...");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("user_status_change");
      socket.off("online_users");
      socket.off("message_deleted");
    };
  }, [userId, friend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    socket.emit("send_message", {
      sender_id: userId,
      receiver_id: friend.id,
      message: newMessage
    });

    setNewMessage("");
  };

  // Sağ tık menüsünü kapat
  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
  };

  // Mesaj silme işlemi
  const handleDeleteMessage = async (messageId) => {
    try {
      socket.emit('delete_message', {
        message_id: messageId,
        user_id: userId
      });
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      handleCloseContextMenu();
    } catch (error) {
      console.error("Mesaj silinirken hata oluştu:", error);
    }
  };

  // Sağ tık menüsünü kapatmak için window'a event listener ekle
  useEffect(() => {
    const closeMenu = () => handleCloseContextMenu();
    if (contextMenu.visible) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu.visible]);

  return (
    <div style={{ 
      height: 'calc(100vh - 35px)', // Title bar yüksekliğini çıkar
      display: 'flex', 
      flexDirection: 'column', 
      color: '#eee', 
      backgroundColor: '#121212',
      position: 'relative'
    }}>
      
      {/* Başlık */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #333', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#1a1a1a'
      }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            cursor: 'pointer',
            padding: '5px 10px',
            borderRadius: '8px',
            transition: 'background-color 0.2s'
          }}
          onClick={() => {
            setSelectedUserId(friend.id);
            setIsProfileOpen(true);
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#333'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#333',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {friendProfile?.profile_picture ? (
                <img
                  src={friendProfile.profile_picture}
                  alt="Profil"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default_avatar.png';
                  }}
                />
              ) : (
                <IoPersonOutline size={24} color="#666" />
              )}
            </div>
            <span
              style={{
                position: 'absolute',
                right: '-4px',
                bottom: '-4px',
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                background: isOnline ? '#4caf50' : '#888',
                border: '2px solid #1a1a1a',
                boxSizing: 'border-box',
                display: 'block'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', lineHeight: 1, gap: '0' }}>
            <h2 style={{ 
              margin: 0,
              fontSize: '1.2rem',
              color: '#fff'
            }}>
              {friend.username}
            </h2>
            <span style={{ color: '#b3b3b3', fontSize: '13px', fontWeight: 500 }}>
              {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
            </span>
          </div>
        </div>
      </div>

      {/* Mesajlar Alanı */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        backgroundColor: '#121212'
      }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{
            marginBottom: '15px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: '8px',
            justifyContent: msg.sender_id === userId ? 'flex-end' : 'flex-start'
            }}
            onContextMenu={(e) => {
              if (msg.sender_id === userId) { // Sadece kendi mesajlarımızı silebiliriz
                e.preventDefault();
                setContextMenu({ 
                  visible: true, 
                  x: e.clientX, 
                  y: e.clientY, 
                  messageId: msg.id 
                });
              }
            }}
          >
            {msg.sender_id !== userId && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#333',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {friendProfile?.profile_picture ? (
                  <img
                    src={friendProfile.profile_picture}
                    alt="Profil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default_avatar.png';
                    }}
                  />
                ) : (
                  <IoPersonOutline size={20} color="#666" />
                )}
              </div>
            )}
            <div style={{
              maxWidth: '70%',
              padding: '10px 15px',
              borderRadius: '15px',
              backgroundColor: msg.sender_id === userId ? '#0084ff' : '#333',
              color: '#fff',
              wordBreak: 'break-word',
              position: 'relative'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Sağ tık menüsü */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: '#232323',
            border: '1px solid #444',
            borderRadius: '6px',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.15)',
            zIndex: 9999,
            minWidth: '120px',
            padding: '6px 0'
          }}
          onMouseLeave={handleCloseContextMenu}
        >
          <div
            onClick={() => handleDeleteMessage(contextMenu.messageId)}
            style={{
              padding: '8px 16px',
              color: '#ff4444',
              cursor: 'pointer',
              fontSize: '15px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              transition: 'background 0.2s',
              borderRadius: '4px'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#333'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            Mesajı Sil
          </div>
        </div>
      )}

      {/* Mesaj Gönderme Alanı */}
      <div style={{ 
        padding: '24px', 
        borderTop: '1px solid #333',
        backgroundColor: '#1a1a1a'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Mesajınızı yazın..."
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '20px',
              border: '1px solid #333',
              backgroundColor: '#333',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              padding: '12px 24px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: '#0084ff',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Gönder
          </button>
        </div>
      </div>

      {/* Profil Modalı */}
      {isProfileOpen && selectedUserId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setIsProfileOpen(false);
                setSelectedUserId(null);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#333'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <IoCloseOutline size={24} />
            </button>
            <Profile 
              userId={selectedUserId} 
              isOpen={isProfileOpen}
              onClose={() => {
                setIsProfileOpen(false);
                setSelectedUserId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
