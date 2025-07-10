import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  IoSettingsOutline, 
  IoNotificationsOutline, 
  IoLockClosedOutline,
  IoPersonOutline,
  IoArrowBackOutline,
  IoAppsOutline,
  IoCameraOutline,
  IoCloseOutline,
  IoLogOutOutline
} from "react-icons/io5";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username')
  });

  // Değişiklik takibi için state'ler
  const [tempProfileImage, setTempProfileImage] = useState(null);
  const [tempStatus, setTempStatus] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Şifre değiştirme için state'ler
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState('');
  const [passwordModalSuccess, setPasswordModalSuccess] = useState('');

  // Bildirim ayarları için state'ler - başlangıçta boş
  const [notificationSettings, setNotificationSettings] = useState({
    messageNotifications: false,
    friendshipNotifications: false,
    systemNotifications: false,
    notificationSound: false,
    notificationsEnabled: false
  });

  // Sayfa ilk yüklendiğinde localStorage'dan notificationSound ayarını oku
  useEffect(() => {
    const soundSetting = localStorage.getItem('notificationSound');
    if (soundSetting !== null) {
      setNotificationSettings(prev => ({
        ...prev,
        notificationSound: soundSetting === 'true'
      }));
    }
  }, []);

  // User kontrolü
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (!userId || !username) {
      navigate('/login');
      return;
    }

    setUser({ id: userId, username: username });
  }, [navigate]);

  // Kullanıcı profilini yükle
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.id) return;

      try {
        // Profil bilgilerini al
        const profileResponse = await axios.get(`http://127.0.0.5:5000/user/get_profile/${user.id}`);
        setStatus(profileResponse.data.status);
        setTempStatus(profileResponse.data.status);
        setDisplayName(profileResponse.data.display_name || '');
        setTempDisplayName(profileResponse.data.display_name || '');
        setEmail(profileResponse.data.email || '');

        // Bildirim ayarlarını al
        const notificationResponse = await axios.post('http://127.0.0.5:5000/notification_settings/get_notification_settings', {
          user_id: user.id
        });

        if (notificationResponse.data.settings) {
          const settings = notificationResponse.data.settings;
          console.log('Veritabanından alınan bildirim ayarları:', settings);
          // En az bir bildirim açık mı kontrolü
          const anyNotificationEnabled = settings.receive_message_notifications || 
                                        settings.receive_friend_notifications || 
                                        settings.receive_system_notifications;
          // Bildirim sesi ayarını localStorage'a kaydet
          localStorage.setItem('notificationSound', String(settings.notification_sound_enabled));
          setNotificationSettings({
            notificationsEnabled: anyNotificationEnabled,
            messageNotifications: settings.receive_message_notifications,
            friendshipNotifications: settings.receive_friend_notifications,
            systemNotifications: settings.receive_system_notifications,
            notificationSound: localStorage.getItem('notificationSound') === 'true'
          });
        }

        // Profil fotoğrafı URL'sini önbellek kontrolü ile oluştur
        const timestamp = new Date().getTime();
        const profileImageUrl = `http://127.0.0.5:5000/pp/${profileResponse.data.profile_picture}?t=${timestamp}`;
        setProfileImage(profileImageUrl);
        setTempProfileImage(profileImageUrl);
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        setError('Profil bilgileri yüklenirken bir hata oluştu.');
        // Varsayılan profil fotoğrafını göster
        setProfileImage('/default_avatar.png');
        setTempProfileImage('/default_avatar.png');
      }
    };
    fetchProfile();
  }, [user.id]);

  // Değişiklikleri kontrol et
  useEffect(() => {
    const hasProfileImageChanged = tempProfileImage !== profileImage;
    const hasStatusChanged = tempStatus !== status;
    const hasDisplayNameChanged = tempDisplayName !== displayName;
    setHasChanges(hasProfileImageChanged || hasStatusChanged || hasDisplayNameChanged);
  }, [tempProfileImage, tempStatus, tempDisplayName, profileImage, status, displayName]);

  // notificationsEnabled'ı her render'da otomatik olarak güncelle
  useEffect(() => {
    const enabled = notificationSettings.messageNotifications ||
                   notificationSettings.friendshipNotifications ||
                   notificationSettings.systemNotifications;
    if (notificationSettings.notificationsEnabled !== enabled) {
      setNotificationSettings(prev => ({ ...prev, notificationsEnabled: enabled }));
    }
  }, [notificationSettings.messageNotifications, notificationSettings.friendshipNotifications, notificationSettings.systemNotifications]);

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordModalError('');
    setPasswordModalSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordModalError('');
    setPasswordModalSuccess('');
  };

  const handlePasswordChangeModal = async (e) => {
    e.preventDefault();
    if (!user.id) return;
    setPasswordModalError('');
    setPasswordModalSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordModalError('Yeni şifreler eşleşmiyor!');
      return;
    }
    try {
      await axios.put(`http://127.0.0.5:5000/user/change_password/${user.id}`, {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordModalSuccess('Şifre başarıyla değiştirildi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordModalSuccess('');
      }, 1200);
    } catch (error) {
      setPasswordModalError(error.response?.data?.error || 'Şifre değiştirme işlemi başarısız!');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }

      // Dosya tipi kontrolü
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Sadece JPEG, PNG ve GIF formatları desteklenmektedir.');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusChange = (e) => {
    setTempStatus(e.target.value);
  };

  const handleDisplayNameChange = (e) => {
    setTempDisplayName(e.target.value);
  };

  const handleSaveChanges = async () => {
    setError('');
    setSuccess('');

    try {
      // Profil fotoğrafı değişikliği varsa
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profile_picture', selectedFile);

        const response = await axios.post(
          `http://127.0.0.5:5000/user/update_profile_picture/${user.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        // Yeni profil fotoğrafı URL'sini önbellek kontrolü ile oluştur
        const timestamp = new Date().getTime();
        const newProfileImageUrl = `http://127.0.0.5:5000/pp/${response.data.profile_picture}?t=${timestamp}`;
        setProfileImage(newProfileImageUrl);
      }

      // Durum mesajı değişikliği varsa
      if (tempStatus !== status) {
        await axios.put(`http://127.0.0.5:5000/user/update_status/${user.id}`, {
          status: tempStatus
        });
        setStatus(tempStatus);
      }

      // Görünen ad değişikliği varsa
      if (tempDisplayName !== displayName) {
        await axios.put(`http://127.0.0.5:5000/user/update_display_name/${user.id}`, {
          display_name: tempDisplayName
        });
        setDisplayName(tempDisplayName);
      }

      setSuccess('Değişiklikler başarıyla kaydedildi!');
      setHasChanges(false);
      setSelectedFile(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Değişiklikler kaydedilirken bir hata oluştu!');
      // Hata durumunda eski değerlere geri dön
      setTempProfileImage(profileImage);
      setTempDisplayName(displayName);
    }
  };

  const handleDiscardChanges = () => {
    setTempProfileImage(profileImage);
    setTempStatus(status);
    setTempDisplayName(displayName);
    setSelectedFile(null);
    setHasChanges(false);
  };

  // Çıkış fonksiyonu
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
    window.location.reload();
  };

  // Bildirim ayarlarını güncelle
  const handleNotificationSettingChange = async (setting) => {
    try {
      // Önce state'i güncelle
      const newSettings = {
        ...notificationSettings,
        [setting]: !notificationSettings[setting]
      };

      // Eğer bildirim sesi ayarı değişiyorsa localStorage'a kaydet
      if (setting === 'notificationSound') {
        localStorage.setItem('notificationSound', String(newSettings.notificationSound));
      }

      // Eğer ana toggle değilse, diğer bildirimlerin durumuna göre notificationsEnabled'ı güncelle
      if (setting !== 'notificationsEnabled') {
        const otherSettings = ['messageNotifications', 'friendshipNotifications', 'systemNotifications', 'notificationSound']
          .filter(s => s !== setting)
          .map(s => notificationSettings[s]);
        newSettings.notificationsEnabled = newSettings[setting] || otherSettings.some(s => s);
      }

      // State'i hemen güncelle
      setNotificationSettings(newSettings);

      // Backend API endpoint'lerine göre ayarları güncelle
      let endpoint = '';
      let requestData = { user_id: user.id };

      // Controller'daki parametre isimlerine göre request data'yı hazırla
      switch (setting) {
        case 'messageNotifications':
          endpoint = '/notification_settings/message_notification';
          requestData = {
            user_id: user.id,
            message_notification: newSettings.messageNotifications
          };
          break;
        case 'friendshipNotifications':
          endpoint = '/notification_settings/friend_notification';
          requestData = {
            user_id: user.id,
            friend_notification: newSettings.friendshipNotifications
          };
          break;
        case 'systemNotifications':
          endpoint = '/notification_settings/system_notification';
          requestData = {
            user_id: user.id,
            system_notification: newSettings.systemNotifications
          };
          break;
        case 'notificationSound':
          endpoint = '/notification_settings/notification_sound';
          requestData = {
            user_id: user.id,
            notification_sound: newSettings.notificationSound
          };
          break;
        default:
          throw new Error('Geçersiz bildirim ayarı');
      }

      // API'ye gönder ve controller'dan gelen response'u kontrol et
      const response = await axios.post(`http://127.0.0.5:5000${endpoint}`, requestData);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Başarı mesajını göster
      setSuccess(response.data.message || 'Bildirim ayarları güncellendi!');
      
      // Hata mesajını temizle
      setError('');

      // Güncelleme başarılı olduktan sonra ayarları tekrar çek
      const notificationResponse = await axios.post('http://127.0.0.5:5000/notification_settings/get_notification_settings', {
        user_id: user.id
      });

      if (notificationResponse.data.settings) {
        const settings = notificationResponse.data.settings;
        console.log('Güncellenmiş bildirim ayarları:', settings);
        // En az bir bildirim açık mı kontrolü
        const anyNotificationEnabled = settings.receive_message_notifications || 
                                      settings.receive_friend_notifications || 
                                      settings.receive_system_notifications;
        // Bildirim sesi ayarını localStorage'a kaydet
        localStorage.setItem('notificationSound', String(settings.notification_sound_enabled));
        setNotificationSettings({
          notificationsEnabled: anyNotificationEnabled,
          messageNotifications: settings.receive_message_notifications,
          friendshipNotifications: settings.receive_friend_notifications,
          systemNotifications: settings.receive_system_notifications,
          notificationSound: localStorage.getItem('notificationSound') === 'true'
        });
      }
    } catch (error) {
      console.error('Bildirim ayarı güncellenirken hata:', error);
      // Hata durumunda eski state'e geri dön
      setNotificationSettings(notificationSettings);
      setError(error.response?.data?.error || 'Bildirim ayarları güncellenirken bir hata oluştu!');
      setSuccess('');
    }
  };

  // Tüm bildirimleri aç/kapat
  const handleToggleAllNotifications = async () => {
    try {
      // Önce state'i güncelle
      const newSettings = {
        ...notificationSettings,
        notificationsEnabled: !notificationSettings.notificationsEnabled,
        // Tüm bildirimleri ana toggle'a bağlı olarak güncelle
        messageNotifications: !notificationSettings.notificationsEnabled,
        friendshipNotifications: !notificationSettings.notificationsEnabled,
        systemNotifications: !notificationSettings.notificationsEnabled,
        notificationSound: !notificationSettings.notificationsEnabled
      };

      // State'i hemen güncelle
      setNotificationSettings(newSettings);

      // Controller'daki parametre yapısına göre request data'yı hazırla
      const requestData = {
        user_id: user.id,
        notification_settings: {
          receive_message_notifications: newSettings.messageNotifications,
          receive_friend_notifications: newSettings.friendshipNotifications,
          receive_system_notifications: newSettings.systemNotifications,
          notification_sound_enabled: newSettings.notificationSound
        }
      };

      // API'ye gönder ve controller'dan gelen response'u kontrol et
      const response = await axios.post('http://127.0.0.5:5000/notification_settings/all_notification_settings', requestData);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Başarı mesajını göster
      setSuccess(response.data.message || (notificationSettings.notificationsEnabled ? 'Tüm bildirimler kapatıldı!' : 'Tüm bildirimler açıldı!'));
      setError('');

      // Güncelleme başarılı olduktan sonra ayarları tekrar çek
      const notificationResponse = await axios.post('http://127.0.0.5:5000/notification_settings/get_notification_settings', {
        user_id: user.id
      });

      if (notificationResponse.data.settings) {
        const settings = notificationResponse.data.settings;
        console.log('Güncellenmiş bildirim ayarları:', settings);
        // En az bir bildirim açık mı kontrolü
        const anyNotificationEnabled = settings.receive_message_notifications || 
                                      settings.receive_friend_notifications || 
                                      settings.receive_system_notifications;
        // Bildirim sesi ayarını localStorage'a kaydet
        localStorage.setItem('notificationSound', String(settings.notification_sound_enabled));
        setNotificationSettings({
          notificationsEnabled: anyNotificationEnabled,
          messageNotifications: settings.receive_message_notifications,
          friendshipNotifications: settings.receive_friend_notifications,
          systemNotifications: settings.receive_system_notifications,
          notificationSound: localStorage.getItem('notificationSound') === 'true'
        });
      }
    } catch (error) {
      console.error('Tüm bildirimler güncellenirken hata:', error);
      // Hata durumunda eski state'e geri dön
      setNotificationSettings(notificationSettings);
      setError(error.response?.data?.error || 'Bildirim ayarları güncellenirken bir hata oluştu!');
      setSuccess('');
    }
  };

  // User yoksa loading göster
  if (!user || !user.id) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#121212',
        color: '#fff'
      }}>
        Yükleniyor...
      </div>
    );
  }

  const renderProfileSettings = () => (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Profil Kartı */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '30px'
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#333',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onClick={() => fileInputRef.current?.click()}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              {tempProfileImage ? (
                <img
                  src={tempProfileImage}
                  alt="Profil"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default_avatar.png';
                  }}
                />
              ) : (
                <IoPersonOutline size={60} color="#666" style={{ margin: '30px' }} />
              )}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '5px',
                opacity: 0,
                transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '1'}
              onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                <IoCameraOutline size={20} color="#fff" />
                <span style={{ color: '#fff', fontSize: '14px' }}>Fotoğraf Değiştir</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '24px' }}>
              {tempDisplayName || user.username}
            </h2>
            <p style={{ margin: 0, color: '#b3b3b3', fontSize: '14px' }}>
              @{user.username}
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid #ff4444',
            borderRadius: '8px',
            color: '#ff4444',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            border: '1px solid #00ff00',
            borderRadius: '8px',
            color: '#00ff00',
            marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#b3b3b3',
              fontSize: '14px',
              fontWeight: 500
            }}>
              Görünen Ad
            </label>
            <input
              type="text"
              value={tempDisplayName}
              onChange={handleDisplayNameChange}
              placeholder="Görünen adınızı girin"
              style={{
                width: '96.3%',
                padding: '12px',
                backgroundColor: '#333',
                borderRadius: '8px',
                border: '1px solid #444',
                color: '#fff',
                fontSize: '14px',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#b3b3b3',
              fontSize: '14px',
              fontWeight: 500
            }}>
              Durum Mesajı
            </label>
            <textarea
              value={tempStatus}
              onChange={handleStatusChange}
              placeholder="Durum mesajınızı girin"
              style={{
                width: '96.3%',
                padding: '12px',
                backgroundColor: '#333',
                borderRadius: '8px',
                border: '1px solid #444',
                color: '#fff',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#b3b3b3',
              fontSize: '14px',
              fontWeight: 500
            }}>
              E-posta
            </label>
            <div style={{
              padding: '12px',
              backgroundColor: '#333',
              borderRadius: '8px',
              border: '1px solid #444',
              color: '#888',
              fontSize: '14px'
            }}>
              {email || 'E-posta adresi eklenmemiş'}
            </div>
          </div>
        </div>
      </div>

      {/* Güvenlik Kartı */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          color: '#fff',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <IoLockClosedOutline size={24} color="#0084ff" />
          Güvenlik
        </h3>
        <button
          onClick={handleOpenPasswordModal}
          style={{
            padding: '12px 24px',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#444'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#333'}
        >
          <IoLockClosedOutline size={20} />
          Şifre Değiştir
        </button>
      </div>

      {/* Değişiklik Kontrol Çubuğu */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: hasChanges ? 'translate(-50%, 0)' : 'translate(-50%, 100%)',
        backgroundColor: '#1a1a1a',
        padding: '16px 24px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        opacity: hasChanges ? 1 : 0,
        pointerEvents: hasChanges ? 'auto' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <span style={{ color: '#fff' }}>
          Değişiklikleri kaydetmek istiyor musunuz?
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              handleDiscardChanges();
              setTempProfileImage(null);
              setTempStatus(status);
              setTempDisplayName(displayName);
              setStatus(status); // Durum mesajını eski haline getir
              setHasChanges(false);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#444'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#333'}
          >
            İptal
          </button>
          <button
            onClick={handleSaveChanges}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0084ff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0073e6'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#0084ff'}
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppSettings = () => (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Bildirimler Kartı */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IoNotificationsOutline size={24} color="#0084ff" />
            <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Bildirimler</h3>
          </div>
          <button
            onClick={handleToggleAllNotifications}
            style={{
              width: '44px',
              height: '24px',
              backgroundColor: notificationSettings.notificationsEnabled ? '#0084ff' : '#666',
              borderRadius: '12px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: notificationSettings.notificationsEnabled ? '22px' : '2px',
              transition: 'left 0.2s'
            }} />
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          opacity: notificationSettings.notificationsEnabled ? 1 : 0.5,
          pointerEvents: notificationSettings.notificationsEnabled ? 'auto' : 'none',
          transition: 'opacity 0.3s'
        }}>
          {/* Mesaj Bildirimleri */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#333',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => handleNotificationSettingChange('messageNotifications')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#0084ff20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IoNotificationsOutline size={24} color="#0084ff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>Mesaj Bildirimleri</div>
                <div style={{ color: '#b3b3b3', fontSize: '13px' }}>Yeni mesajlar için bildirim al</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNotificationSettingChange('messageNotifications');
              }}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: notificationSettings.messageNotifications ? '#0084ff' : '#666',
                borderRadius: '12px',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: notificationSettings.messageNotifications ? '22px' : '2px',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>

          {/* Arkadaşlık Bildirimleri */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#333',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => handleNotificationSettingChange('friendshipNotifications')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#0084ff20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IoPersonOutline size={24} color="#0084ff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>Arkadaşlık Bildirimleri</div>
                <div style={{ color: '#b3b3b3', fontSize: '13px' }}>Arkadaşlık istekleri için bildirim al</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNotificationSettingChange('friendshipNotifications');
              }}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: notificationSettings.friendshipNotifications ? '#0084ff' : '#666',
                borderRadius: '12px',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: notificationSettings.friendshipNotifications ? '22px' : '2px',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>

          {/* Sistem Bildirimleri */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#333',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => handleNotificationSettingChange('systemNotifications')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#0084ff20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IoSettingsOutline size={24} color="#0084ff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>Sistem Bildirimleri</div>
                <div style={{ color: '#b3b3b3', fontSize: '13px' }}>Sistem güncellemeleri için bildirim al</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNotificationSettingChange('systemNotifications');
              }}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: notificationSettings.systemNotifications ? '#0084ff' : '#666',
                borderRadius: '12px',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: notificationSettings.systemNotifications ? '22px' : '2px',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>

          {/* Bildirim Sesi */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#333',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => handleNotificationSettingChange('notificationSound')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#0084ff20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IoNotificationsOutline size={24} color="#0084ff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>Bildirim Sesi</div>
                <div style={{ color: '#b3b3b3', fontSize: '13px' }}>Bildirimler için ses çal</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNotificationSettingChange('notificationSound');
              }}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: notificationSettings.notificationSound ? '#0084ff' : '#666',
                borderRadius: '12px',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: notificationSettings.notificationSound ? '22px' : '2px',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>
        </div>

        {/* Uyarı mesajı sadece hepsi kapalıysa göster */}
        {!(notificationSettings.messageNotifications || notificationSettings.friendshipNotifications || notificationSettings.systemNotifications) && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#333',
            borderRadius: '8px',
            color: '#b3b3b3',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Tüm bildirimler şu anda kapalı. Bildirimleri açmak için üstteki düğmeyi kullanın.
          </div>
        )}
      </div>

      {/* Çıkış Kartı */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <IoLogOutOutline size={24} color="#ff4444" />
          <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Hesap</h3>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ff4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#ff3333'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#ff4444'}
        >
          <IoLogOutOutline size={20} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
  

  return (
    <Layout title="Ayarlar">
      <div style={{ 
        height: 'calc(100vh - 35px)',
        backgroundColor: '#121212',
        color: '#fff',
        overflowY: 'auto'
      }}>
        {/* Üst Bar */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          backgroundColor: '#1a1a1a'
        }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#333'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <IoArrowBackOutline size={24} />
          </button>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px'
          }}>
            <IoSettingsOutline size={24} color="#0084ff" />
            <h2 style={{ margin: 0 }}>Ayarlar</h2>
          </div>
        </div>

        {/* Tab Butonları */}
        <div style={{
          display: 'flex',
          padding: '20px',
          gap: '10px',
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #333'
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'profile' ? '#0084ff' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = activeTab === 'profile' ? '#0073e6' : '#444'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = activeTab === 'profile' ? '#0084ff' : '#333'}
          >
            <IoPersonOutline size={20} />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('app')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'app' ? '#0084ff' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = activeTab === 'app' ? '#0073e6' : '#444'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = activeTab === 'app' ? '#0084ff' : '#333'}
          >
            <IoAppsOutline size={20} />
            Uygulama
          </button>
        </div>

        {/* İçerik */}
        {activeTab === 'profile' ? renderProfileSettings() : renderAppSettings()}

        {/* Şifre Değiştirme Modalı */}
        {showPasswordModal && (
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
              padding: '30px',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Şifre Değiştir</h3>
                <button
                  onClick={handleClosePasswordModal}
                  style={{
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
              </div>

              <form onSubmit={handlePasswordChangeModal} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#b3b3b3',
                    fontSize: '14px',
                    fontWeight: 500
                  }}>
                    Mevcut Şifre
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      color: '#fff',
                      fontSize: '14px',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#b3b3b3',
                    fontSize: '14px',
                    fontWeight: 500
                  }}>
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      color: '#fff',
                      fontSize: '14px',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#b3b3b3',
                    fontSize: '14px',
                    fontWeight: 500
                  }}>
                    Yeni Şifre (Tekrar)
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      color: '#fff',
                      fontSize: '14px',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>

                {passwordModalError && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid #ff4444',
                    borderRadius: '8px',
                    color: '#ff4444'
                  }}>
                    {passwordModalError}
                  </div>
                )}

                {passwordModalSuccess && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    border: '1px solid #00ff00',
                    borderRadius: '8px',
                    color: '#00ff00'
                  }}>
                    {passwordModalSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    padding: '12px',
                    backgroundColor: '#0084ff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#0073e6'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#0084ff'}
                >
                  Şifreyi Değiştir
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
