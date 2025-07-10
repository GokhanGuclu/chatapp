import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Profile from './Profile';

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

const Friends = ({ onSelectFriend, selectedMenu }) => {
  const [friends, setFriends] = useState([]);
  const [friendProfiles, setFriendProfiles] = useState({});
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState("friends");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, userId: null });
  const [deleteModal, setDeleteModal] = useState({ visible: false, userId: null });
  const [friendStatuses, setFriendStatuses] = useState({}); // { userId: { is_online, last_seen } }
  const [unreadNotifications, setUnreadNotifications] = useState(0); // Okunmamış bildirim sayısı
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef(null);

  const userId = localStorage.getItem("userId");

  // selectedMenu değiştiğinde arkadaş listesini yeniden çek
  useEffect(() => {
    if (selectedMenu === 'friends') {
      console.log("Arkadaşlar menüsüne geçildi, liste yenileniyor...");
      forceUpdateFriendsList();
    }
  }, [selectedMenu]);

  const fetchFriendsStatus = useCallback(() => {
    axios.get(`http://localhost:5000/user/get_friends_status/${userId}`)
      .then(response => {
        const statuses = {};
        response.data.friends.forEach(friend => {
          statuses[friend.id] = {
            is_online: friend.is_online,
            last_seen: friend.last_seen
          };
        });
        setFriendStatuses(statuses);
      })
      .catch(error => console.error("Arkadaş durumları alınırken hata oluştu:", error));
  }, [userId]);

  const fetchFriends = useCallback(() => {
    // Eğer zaten güncelleme yapılıyorsa, yeni istek yapma
    if (isUpdating) {
      console.log("Güncelleme zaten devam ediyor, yeni istek atlanıyor...");
      return;
    }

    console.log("Arkadaş listesi alınıyor...");
    setIsUpdating(true);
    
    axios.get(`http://localhost:5000/friendship/list/${userId}`)
      .then(response => {
        console.log("Arkadaş listesi alındı:", response.data.friends);
        setFriends(response.data.friends);
      })
      .catch(error => {
        console.error("Arkadaş listesi alınırken hata oluştu:", error);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }, [userId, isUpdating]);

  // Arkadaş listesi ve durumlarını birlikte güncelle
  const updateFriendsList = useCallback(() => {
    // Eğer zaten güncelleme yapılıyorsa, yeni istek yapma
    if (isUpdating) {
      console.log("Güncelleme zaten devam ediyor, yeni istek atlanıyor...");
      return;
    }

    console.log("Arkadaş listesi ve durumları güncelleniyor...");
    setIsUpdating(true);

    // Önce arkadaş listesini güncelle
    axios.get(`http://localhost:5000/friendship/list/${userId}`)
      .then(response => {
        console.log("Arkadaş listesi alındı:", response.data.friends);
        setFriends(response.data.friends);
        // Arkadaş listesi güncellendikten sonra durumları güncelle
        return fetchFriendsStatus();
      })
      .catch(error => {
        console.error("Arkadaş listesi güncellenirken hata oluştu:", error);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }, [userId, isUpdating, fetchFriendsStatus]);

  // Zorla güncelleme fonksiyonu
  const forceUpdateFriendsList = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Güncellemeyi 500ms geciktir ve önceki güncellemeleri iptal et
    updateTimeoutRef.current = setTimeout(() => {
      setIsUpdating(false);
      updateFriendsList();
    }, 500);
  }, [updateFriendsList]);

  const fetchPendingRequests = useCallback(() => {
    axios.get(`http://localhost:5000/friendship/pending/${userId}`)
      .then(response => setRequests(response.data.requests))
      .catch(error => console.error("Gelen istekler alınırken hata oluştu:", error));
  }, [userId]);

  const fetchSentRequests = useCallback(() => {
    axios.get(`http://localhost:5000/friendship/sent/${userId}`)
      .then(response => setSentRequests(response.data.requests))
      .catch(error => console.error("Gönderilen istekler alınırken hata oluştu:", error));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    console.log("Friends component yüklendi, userId:", userId);

    // Socket event listener'ları
    const setupSocketListeners = () => {
      socket.on("connect", () => {
        console.log("Socket bağlantısı kuruldu, socket id:", socket.id);
        socket.emit("join", { user_id: userId });
        // İlk bağlantıda arkadaş listesini al
        forceUpdateFriendsList();
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

      socket.on("user_status_change", (data) => {
        console.log("Durum değişikliği alındı:", data);
        setFriendStatuses(prev => ({
          ...prev,
          [data.user_id]: {
            is_online: data.is_online,
            last_seen: data.last_seen
          }
        }));
      });

      socket.on("notification_count", (data) => {
        console.log("Bildirim sayısı güncellendi:", data);
        setUnreadNotifications(data.count);
      });

      socket.on("friend_request_received", (data) => {
        console.log("Arkadaşlık isteği alındı event'i tetiklendi:", data);
        console.log("Mevcut istekler:", requests);
        if (data.to_user_id === userId) {
          const friendshipId = parseInt(data.friendship_id);
          if (!friendshipId || isNaN(friendshipId)) {
            console.error("Geçersiz friendship_id:", data.friendship_id);
            return;
          }
          
          setRequests(prev => {
            console.log("Önceki istekler:", prev);
            if (prev.some(req => req.friendship_id === friendshipId)) {
              console.log("Bu istek zaten mevcut, eklenmeyecek");
              return prev;
            }
            const newRequests = [
              ...prev,
              {
                friendship_id: friendshipId,
                user_id: parseInt(data.from_user_id),
                username: data.from_username,
                email: ""
              }
            ];
            console.log("Yeni istekler listesi:", newRequests);
            return newRequests;
          });
        }
      });

      socket.on("friend_request_sent", (data) => {
        console.log("Arkadaşlık isteği gönderildi event'i tetiklendi:", data);
        console.log("Mevcut gönderilen istekler:", sentRequests);
        if (data.from_user_id === userId) {
          const friendshipId = parseInt(data.friendship_id);
          if (!friendshipId || isNaN(friendshipId)) {
            console.error("Geçersiz friendship_id:", data.friendship_id);
            return;
          }
          
          setSentRequests(prev => {
            console.log("Önceki gönderilen istekler:", prev);
            if (prev.some(req => req.friendship_id === friendshipId)) {
              console.log("Bu gönderilen istek zaten mevcut, eklenmeyecek");
              return prev;
            }
            const newSentRequests = [
              ...prev,
              {
                friendship_id: friendshipId,
                user_id: parseInt(data.to_user_id),
                username: data.to_username,
                email: ""
              }
            ];
            console.log("Yeni gönderilen istekler listesi:", newSentRequests);
            return newSentRequests;
          });
        }
      });

      socket.on("friend_request_handled", (data) => {
        console.log("Arkadaşlık isteği işlendi:", data);
        if (data.status === "accepted" || data.status === "rejected") {
          setRequests(prev => prev.filter(req => req.friendship_id !== data.friendship_id));
          setSentRequests(prev => prev.filter(req => req.friendship_id !== data.friendship_id));
          
          if (data.status === "accepted") {
            forceUpdateFriendsList();
          }
        }
      });

      socket.on("friend_added", (data) => {
        console.log("Arkadaş eklendi event'i tetiklendi:", data);
        if (data.status === "accepted") {
          forceUpdateFriendsList();
          
          setRequests(prev => prev.filter(req => 
            req.user_id !== data.friend_id && req.user_id !== data.user_id
          ));
          setSentRequests(prev => prev.filter(req => 
            req.user_id !== data.friend_id && req.user_id !== data.user_id
          ));
        }
      });

      socket.on("friend_request_cancelled", (data) => {
        console.log("Arkadaşlık isteği iptal edildi event'i tetiklendi:", data);
        setRequests(prev => prev.filter(req => req.user_id !== data.from_user_id));
        setSentRequests(prev => prev.filter(req => req.user_id !== data.to_user_id));
      });
    };

    // İlk yükleme
    fetchPendingRequests();
    fetchSentRequests();

    // Socket bağlantısını başlat
    if (!socket.connected) {
      console.log("Socket bağlantısı başlatılıyor...");
      socket.connect();
    }

    // Event listener'ları kur
    setupSocketListeners();

    // Sadece son görülme zamanını düzenli olarak güncelle
    const lastSeenInterval = setInterval(() => {
      if (!isUpdating) {
        axios.put(`http://localhost:5000/user/update_last_seen/${userId}`, {}, {
          withCredentials: true
        }).catch(error => {
          console.error("Son görülme güncellenirken hata:", error);
        });
      }
    }, 30000);

    // Cleanup
    return () => {
      console.log("Friends component unmount oluyor...");
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      socket.off("friend_request_received");
      socket.off("friend_request_sent");
      socket.off("friend_added");
      socket.off("friend_request_cancelled");
      socket.off("friend_request_handled");
      socket.off("user_status_change");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      clearInterval(lastSeenInterval);
    };
  }, [userId, updateFriendsList, fetchPendingRequests, fetchSentRequests, forceUpdateFriendsList, isUpdating]);

  // Arkadaşların profil bilgilerini çek
  useEffect(() => {
    const fetchProfiles = async () => {
      const newProfiles = {};
      await Promise.all(friends.map(async (friend) => {
        try {
          const res = await axios.get(`http://localhost:5000/user/get_profile/${friend.id}`);
          newProfiles[friend.id] = {
            displayName: res.data.display_name || res.data.username,
            profilePicture: res.data.profile_picture
              ? `http://localhost:5000/pp/${res.data.profile_picture}`
              : '/default_avatar.png'
          };
        } catch {
          newProfiles[friend.id] = {
            displayName: friend.username,
            profilePicture: '/default_avatar.png'
          };
        }
      }));
      setFriendProfiles(newProfiles);
    };
    if (friends.length > 0) fetchProfiles();
  }, [friends]);

  const handleAddFriend = () => {
    if (!userId || !newFriendUsername) {
      console.log("Kullanıcı ID veya kullanıcı adı eksik");
      return;
    }

    console.log("Arkadaş ekleme isteği gönderiliyor:", newFriendUsername);
    
    axios.get(`http://localhost:5000/user/get_by_username/${newFriendUsername}`)
      .then(response => {
        const friendId = response.data.id;
        console.log("Kullanıcı bulundu, arkadaşlık isteği gönderiliyor:", friendId);
        
        // Socket event'i ile arkadaşlık isteği gönder
        socket.emit('send_friend_request', {
          user_id: userId,
          friend_id: friendId
        });
        
        setMessage("Arkadaşlık isteği gönderildi.");
        setNewFriendUsername("");
      })
      .catch(error => {
        console.error("Arkadaş ekleme hatası:", error.response?.data || error.message);
        setMessage(error.response?.data?.error || "Hata: Kullanıcı bulunamadı veya zaten isteğiniz var.");
      });
  };

  const handleRejectRequest = async (friendshipId) => {
    console.log("İstek reddediliyor:", friendshipId);
    if (!friendshipId) {
      console.error("Friendship ID eksik");
      setMessage("İstek ID'si bulunamadı");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/friendship/reject", {
        friendship_id: friendshipId
      });
      console.log("İstek reddedildi:", response.data);

      // Bildirimi okundu olarak işaretle
      socket.emit("mark_notification_read", {
        notification_id: response.data.notification_id,
        user_id: userId
      });

      // İstek listesini güncelle
      setRequests(prev => prev.filter(req => req.friendship_id !== friendshipId));
      setMessage("Arkadaşlık isteği reddedildi");
    } catch (error) {
      console.error("İstek reddedilirken hata:", error);
      setMessage(error.response?.data?.error || "İstek reddedilirken bir hata oluştu");
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    console.log("İstek kabul ediliyor:", friendshipId);
    if (!friendshipId) {
      console.error("Friendship ID eksik");
      setMessage("İstek ID'si bulunamadı");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/friendship/accept", {
        friendship_id: friendshipId
      });
      console.log("İstek kabul edildi:", response.data);

      // Bildirimi okundu olarak işaretle
      socket.emit("mark_notification_read", {
        notification_id: response.data.notification_id,
        user_id: userId
      });

      // İstek listesini güncelle
      setRequests(prev => prev.filter(req => req.friendship_id !== friendshipId));
      setMessage("Arkadaşlık isteği kabul edildi");
      updateFriendsList();
    } catch (error) {
      console.error("İstek kabul edilirken hata:", error);
      setMessage(error.response?.data?.error || "İstek kabul edilirken bir hata oluştu");
    }
  };

  const handleCancelRequest = (friendId) => {
    axios.post(`http://localhost:5000/friendship/cancel`, {
      user_id: userId,
      friend_id: friendId
    }).then(() => {
      setMessage("Arkadaşlık isteği iptal edildi.");
      fetchSentRequests();
    }).catch(() => {
      setMessage("İptal edilirken bir hata oluştu.");
    });
  };

  const handleRemoveFriend = (friendId) => {
    axios.post(`http://localhost:5000/friendship/remove`, {
      user_id: userId,
      friend_id: friendId
    }).then(() => {
      setMessage("Arkadaş silindi.");
      updateFriendsList();
    }).catch(() => {
      setMessage("Arkadaş silinirken bir hata oluştu.");
    });
  };

  // Sağ tık menüsünü kapat
  const handleCloseContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, userId: null });

  // Arkadaşlar sekmesinde arkadaşları göster
  const renderFriendsList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
      {friends.map(friend => {
        const profile = friendProfiles[friend.id] || {};
        const isOnline = friendStatuses[friend.id]?.is_online;
        return (
          <div
            key={friend.id}
            onClick={() => onSelectFriend(friend)}
            onContextMenu={e => {
              e.preventDefault();
              setContextMenu({ visible: true, x: e.clientX, y: e.clientY, userId: friend.id });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              background: '#232323',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              border: '1px solid #292929',
              boxShadow: '0 1px 4px 0 rgba(0,0,0,0.07)'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#252525'}
            onMouseOut={e => e.currentTarget.style.background = '#232323'}
          >
            <div style={{ position: 'relative', width: '32px', height: '32px', marginRight: '0' }}>
              <img
                src={profile.profilePicture || '/default_avatar.png'}
                alt="Profil"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #282828',
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
                  background: isOnline ? '#4caf50' : '#888',
                  border: '2px solid #232323',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', lineHeight: 1, gap: '0', marginLeft: '8px', width: '110px' }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px', lineHeight: 1 }}>{profile.displayName || friend.username}</span>
              <span style={{ color: '#b3b3b3', fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
              </span>
            </div>
            {/* Sadece sil butonu */}
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <button 
                onClick={e => { e.stopPropagation(); setDeleteModal({ visible: true, userId: friend.id }); }}
                style={{ 
                  backgroundColor: '#444', 
                  color: '#ff5555', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '30px', 
                  height: '30px', 
                  cursor: 'pointer', 
                  fontSize: '16px', 
                  lineHeight: '30px', 
                  textAlign: 'center' 
                }}
              >
                ✖
              </button>
            </div>
          </div>
        );
      })}
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
            onClick={() => {
              setIsProfileOpen(true);
              setSelectedUserId(contextMenu.userId);
              handleCloseContextMenu();
            }}
            style={{
              padding: '8px 16px',
              color: '#fff',
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
            Profili Göster
          </div>
        </div>
      )}
    </div>
  );

  // Sağ tık menüsünü kapatmak için window'a event listener ekle
  useEffect(() => {
    const closeMenu = () => handleCloseContextMenu();
    if (contextMenu.visible) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu.visible]);

  // İstekler sekmesinde gelen istekleri göster
  const renderRequestsList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
      {requests.map(req => {
        console.log("İstek render ediliyor:", req);
        return (
          <div
            key={req.friendship_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#232323',
              borderRadius: '8px',
              border: '1px solid #292929'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/default_avatar.png"
                alt="Profil"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <span style={{ color: '#fff', fontWeight: 500 }}>{req.username}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleAcceptRequest(req.friendship_id)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Kabul Et
              </button>
              <button
                onClick={() => handleRejectRequest(req.friendship_id)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Reddet
              </button>
            </div>
          </div>
        );
      })}
      {requests.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          Gelen arkadaşlık isteği bulunmuyor.
        </div>
      )}
    </div>
  );

  // Gönderilen istekler sekmesinde gönderilen istekleri göster
  const renderSentRequestsList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
      {sentRequests.map(req => (
        <div
          key={req.friendship_id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#232323',
            borderRadius: '8px',
            border: '1px solid #292929'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/default_avatar.png"
              alt="Profil"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <span style={{ color: '#fff', fontWeight: 500 }}>{req.username}</span>
          </div>
          <button
            onClick={() => handleCancelRequest(req.user_id)}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#f44336',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            İptal Et
          </button>
        </div>
      ))}
      {sentRequests.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          Gönderilen arkadaşlık isteği bulunmuyor.
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '40px', color: '#eee' }}>
      <h2 style={{ marginBottom: "20px" }}>Arkadaşlar</h2>

      {/* Sekmeler */}
      <div style={{ display: 'flex', marginBottom: '30px' }}>
        <button 
          onClick={() => setSelectedTab("friends")} 
          style={{ 
            flex: 1, 
            padding: '12px', 
            backgroundColor: selectedTab === "friends" ? "#666" : "#333", 
            color: "#fff", 
            border: 'none', 
            borderRadius: "6px" 
          }}
        >
          Arkadaşlar
        </button>
        <button 
          onClick={() => setSelectedTab("requests")} 
          style={{ 
            flex: 1, 
            padding: '12px', 
            backgroundColor: selectedTab === "requests" ? "#666" : "#333", 
            color: "#fff", 
            border: 'none', 
            borderRadius: "6px", 
            marginLeft: "10px",
            position: 'relative'
          }}
        >
          İstekler
          {(requests.length > 0 || unreadNotifications > 0) && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: "#ff4444",
              color: "#fff",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
              minWidth: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              {requests.length + unreadNotifications}
            </span>
          )}
        </button>
        <button 
          onClick={() => setSelectedTab("add")} 
          style={{ 
            flex: 1, 
            padding: '12px', 
            backgroundColor: selectedTab === "add" ? "#666" : "#333", 
            color: "#fff", 
            border: 'none', 
            borderRadius: "6px", 
            marginLeft: "10px" 
          }}
        >
          Arkadaş Ekle
        </button>
      </div>

      {/* Arkadaşlar */}
      {selectedTab === "friends" && (
        <div style={{ backgroundColor: "#1b1b1b", borderRadius: "10px", padding: "20px", marginBottom: "20px", border: "1px solid #333" }}>
          <h3 style={{ marginBottom: "15px" }}>Arkadaşlar</h3>
          {renderFriendsList()}
        </div>
      )}

      {/* İstekler */}
      {selectedTab === "requests" && (
        <div style={{ backgroundColor: "#1b1b1b", borderRadius: "10px", padding: "20px", marginBottom: "20px", border: "1px solid #333" }}>
          <h3>Gelen İstekler</h3>
          {renderRequestsList()}

          <h3 style={{ marginTop: "20px" }}>Gönderilen İstekler</h3>
          {renderSentRequestsList()}
        </div>
      )}

      {/* Arkadaş Ekle */}
      {selectedTab === "add" && (
        <div style={{ backgroundColor: "#1b1b1b", borderRadius: "10px", padding: "20px", marginBottom: "20px", border: "1px solid #333" }}>
          <h3>Arkadaş Ekle</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input 
              type="text" 
              placeholder="Kullanıcı adı" 
              value={newFriendUsername} 
              onChange={(e) => setNewFriendUsername(e.target.value)} 
              style={{ 
                flex: 1,
                padding: '10px', 
                borderRadius: "6px", 
                border: "1px solid #555", 
                backgroundColor: "#111", 
                color: "#fff" 
              }} 
            />
            <button 
              onClick={handleAddFriend} 
              style={{ 
                padding: "10px 20px",
                backgroundColor: "#555",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Ekle
            </button>
          </div>
          {message && (
            <div style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              backgroundColor: message.includes('başarıyla') ? '#2e7d32' : '#c62828',
              color: '#ffffff' 
            }}>
              {message}
            </div>
          )}
        </div>
      )}

      {/* Profil Modalı */}
      {isProfileOpen && selectedUserId && (
        <Profile
          userId={selectedUserId}
          onClose={() => {
            setIsProfileOpen(false);
            setSelectedUserId(null);
          }}
        />
      )}

      {/* Silme onay modali */}
      {deleteModal.visible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#232323',
            borderRadius: '10px',
            padding: '32px 24px 24px 24px',
            minWidth: '320px',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)',
            position: 'relative',
            maxWidth: '90vw',
            textAlign: 'center',
            border: '1px solid #444'
          }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: 18, fontSize: 18, fontWeight: 700, letterSpacing: 0.2 }}>Arkadaşı Sil</h3>
            <p style={{ color: '#ccc', marginBottom: 24, fontSize: 15 }}>
              {(() => {
                const friend = friends.find(f => f.id === deleteModal.userId);
                const profile = friendProfiles[deleteModal.userId] || {};
                return `${profile.displayName || (friend && friend.username) || ''} kişisini silmek istiyor musun?`;
              })()}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button
                onClick={() => {
                  handleRemoveFriend(deleteModal.userId);
                  setDeleteModal({ visible: false, userId: null });
                }}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#ff4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '15px',
                  letterSpacing: 0.2
                }}
              >
                Evet, Sil
              </button>
              <button
                onClick={() => setDeleteModal({ visible: false, userId: null })}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '15px',
                  letterSpacing: 0.2
                }}
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;