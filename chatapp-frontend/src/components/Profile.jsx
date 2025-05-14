import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  IoPersonOutline, 
  IoChatbubbleOutline,
  IoCloseOutline,
  IoTimeOutline
} from "react-icons/io5";

const Profile = ({ isOpen, onClose, userId }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setError("Kullanıcı ID'si bulunamadı.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Profil bilgileri alınıyor...", userId);
      const response = await axios.get(`http://127.0.0.5:5000/user/get_profile/${userId}`);
      console.log("API yanıtı:", response.data);

      if (!response.data) {
        throw new Error("Profil bilgileri alınamadı.");
      }

      const timestamp = new Date().getTime();
      const profileImageUrl = response.data.profile_picture 
        ? `http://127.0.0.5:5000/pp/${response.data.profile_picture}?t=${timestamp}`
        : null;

      setProfileData({
        ...response.data,
        profile_picture: profileImageUrl
      });
    } catch (error) {
      console.error("Profil bilgileri alınırken hata oluştu:", error);
      setError(error.response?.data?.message || "Profil bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      console.log("Profil bileşeni açıldı, userId:", userId);
      fetchProfile();
    }
  }, [isOpen, userId, fetchProfile]);

  if (!isOpen) return null;

  // Modal arka planı için tıklama kontrolü
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{ position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Kapatma butonu */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(0,0,0,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#333'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
        >
          <IoCloseOutline size={22} />
        </button>
        {/* Profil içeriği */}
        <div style={{
          padding: '0',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Yükleniyor durumu */}
          {loading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#fff',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid #0084ff',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ 
                fontSize: '18px', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>Yükleniyor...</div>
              <div style={{ 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(0,0,0,0.2)',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'inline-block'
              }}>
                ID: {userId}
              </div>
            </div>
          )}

          {/* Hata durumu */}
          {error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#ff4444',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
            }}>
              <div style={{ 
                fontSize: '18px', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>{error}</div>
              <div style={{ 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(0,0,0,0.2)',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'inline-block'
              }}>
                ID: {userId}
              </div>
            </div>
          )}

          {/* Profil içeriği */}
          {!loading && !error && profileData && (
            <div style={{
              width: 400,
              background: '#181818',
              borderRadius: '20px',
              boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
              margin: '0 auto',
              overflow: 'hidden',
              border: 'none',
              paddingBottom: 32
            }}>
              {/* Üst banner */}
              <div style={{
                height: '60px',
                background: 'linear-gradient(135deg, #0099ff 0%, #00cfff 100%)',
                position: 'relative',
              }} />

              {/* Profil fotoğrafı */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                overflow: 'visible',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
                border: '4px solid #181818',
                margin: '-50px auto 0 auto',
                zIndex: 2,
                position: 'relative'
              }}>
                {profileData.profile_picture ? (
                  <img
                    src={profileData.profile_picture}
                    alt="Profil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default_avatar.png';
                    }}
                  />
                ) : (
                  <IoPersonOutline size={44} color="#666" />
                )}
                {/* Online/Offline Durum İkonu */}
                <span
                  style={{
                    position: 'absolute',
                    right: '2px',
                    bottom: '2px',
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    background: profileData.is_online ? '#4caf50' : '#888',
                    border: '3px solid #181818',
                    boxSizing: 'border-box',
                    display: 'block',
                    zIndex: 10
                  }}
                />
              </div>

              {/* İsim ve kullanıcı adı */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 12,
                marginBottom: 18
              }}>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.1,
                  marginBottom: '4px',
                  letterSpacing: '0.01em',
                  textShadow: '0 1px 2px rgba(0,0,0,0.10)'
                }}>{profileData.display_name || profileData.username}</span>
                <span style={{
                  fontSize: '1.08rem',
                  color: '#b3b3b3',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  opacity: 0.85
                }}>@{profileData.username}</span>
              </div>

              {/* Bilgi kartları */}
              <div style={{
                padding: '0 24px',
              }}>
                <div style={{
                  display: 'grid',
                  gap: '16px',
                }}>
                  {/* Durum mesajı */}
                  {profileData.status && (
                    <div style={{
                      background: '#222',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'left',
                      border: '1px solid #333',
                      color: '#fff'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        color: '#b3b3b3',
                        fontSize: '14px'
                      }}>
                        <IoChatbubbleOutline size={16} />
                        <span>Durum Mesajı</span>
                      </div>
                      <p style={{
                        margin: 0,
                        color: '#fff',
                        fontSize: '15px',
                        lineHeight: 1.5
                      }}>
                        {profileData.status}
                      </p>
                    </div>
                  )}

                  {/* Katılma tarihi */}
                  <div style={{
                    background: '#222',
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    border: '1px solid #333',
                    color: '#fff'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      color: '#b3b3b3',
                      fontSize: '14px'
                    }}>
                      <IoTimeOutline size={16} />
                      <span>Katılma Tarihi</span>
                    </div>
                    <p style={{
                      margin: 0,
                      color: '#fff',
                      fontSize: '15px',
                      lineHeight: 1.5
                    }}>
                      {new Date(profileData.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Profile; 