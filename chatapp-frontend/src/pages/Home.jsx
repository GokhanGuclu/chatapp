import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import Friends from '../components/Friends';
import Layout from '../components/Layout';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('friends');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const [title, setTitle] = useState('Chat App');

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
          recentChats={friends}
          onSelectFriend={handleSelectFriend}
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
      </div>
    </Layout>
  );
};

export default Home;
