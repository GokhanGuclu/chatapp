import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import Friends from '../components/Friends';
import Layout from '../components/Layout';
import NotificationList from '../components/NotificationList';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('friends');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const [title, setTitle] = useState('Chat App');
  const [activeChats, setActiveChats] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!userId) return;

    axios.get(`http://127.0.0.5:5000/friendship/list/${userId}`)
      .then(response => {
        const fetchedFriends = response.data.friends.map(friend => ({
          id: friend.id,
          username: friend.username
        }));
        setFriends(fetchedFriends);
      })
      .catch(error => {
        console.error("Arkadaş listesi alınamadı:", error);
      });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:5000/message/get_active_chats/${userId}`)
      .then(res => {
        const sorted = res.data.chats.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
        setActiveChats(sorted);
      })
      .catch(() => setActiveChats([]));
  }, [userId]);

  useEffect(() => {
    const refreshHandler = () => {
      axios.get(`http://localhost:5000/message/get_active_chats/${userId}`)
        .then(res => {
          const sorted = res.data.chats.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
          setActiveChats(sorted);
        })
        .catch(() => setActiveChats([]));
    };
    window.addEventListener('refreshActiveChats', refreshHandler);
    return () => window.removeEventListener('refreshActiveChats', refreshHandler);
  }, [userId]);

  useEffect(() => {
    let newTitle = 'Chat App';
    
    switch(selectedMenu) {
      case 'friends':
        newTitle = `${username} - Arkadaşlar`;
        break;
      case 'chat':
        newTitle = `${username} - Sohbet`;
        break;
      case 'settings':
        newTitle = `${username} - Ayarlar`;
        break;
      default:
        newTitle = 'Chat App';
    }
    
    setTitle(newTitle);
  }, [selectedMenu, username]);

  useEffect(() => {
    const handleOpenNotifications = () => {
      setShowNotifications(true);
    };

    window.addEventListener('openNotifications', handleOpenNotifications);
    return () => {
      window.removeEventListener('openNotifications', handleOpenNotifications);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setSelectedMenu('chat');
  };

  const handleMenuSelect = (menu) => {
    if (menu === 'settings') {
      navigate('/settings');
    } else {
      setSelectedMenu(menu);
    }
  };

  return (
    <Layout title={title}>
      <div style={{ 
        display: 'flex', 
        minHeight: 'calc(100vh - 35px)' // Title bar yüksekliğini çıkar
      }}>
        <Sidebar
          user={{
            id: userId,
            username: username
          }}
          onLogout={handleLogout}
          onSelectMenu={handleMenuSelect}
          onSelectFriend={handleSelectFriend}
          activeChats={activeChats}
        />
        <div style={{ 
          flex: 1,
          marginLeft: '250px',
          width: 'calc(100% - 250px)',
          position: 'relative'
        }}>
          {selectedMenu === 'friends' && (
            <Friends friends={friends} onSelectFriend={handleSelectFriend} />
          )}
          {selectedMenu === 'chat' && selectedFriend && (
            <ChatWindow friend={selectedFriend} />
          )}
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
              <NotificationList userId={userId} onClose={() => setShowNotifications(false)} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
