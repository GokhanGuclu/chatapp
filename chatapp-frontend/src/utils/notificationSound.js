// Bildirim sesi için yardımcı fonksiyonlar
let notificationAudio = null;

export const initializeNotificationSound = () => {
  try {
    console.log('Bildirim sesi dosyası yükleniyor...');
    // Ses dosyasını yükle
    notificationAudio = new Audio('/notification.mp3');
    
    notificationAudio.addEventListener('canplaythrough', () => {
      console.log('Bildirim sesi başarıyla yüklendi!');
    });

    notificationAudio.addEventListener('error', (e) => {
      console.error('Bildirim sesi yüklenirken hata:', e);
    });

    notificationAudio.load();
  } catch (error) {
    console.error('Bildirim sesi başlatılırken hata:', error);
  }
};

export const playNotificationSound = () => {
  if (notificationAudio) {
    try {
      console.log('Bildirim sesi çalma denemesi...');
      // Sesi başa sar ve çal
      notificationAudio.currentTime = 0;
      const playPromise = notificationAudio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Bildirim sesi başarıyla çalındı!');
        }).catch(error => {
          console.error('Bildirim sesi çalınırken hata:', error);
        });
      }
    } catch (error) {
      console.error('Bildirim sesi çalınırken beklenmeyen hata:', error);
    }
  } else {
    console.error('Bildirim sesi henüz başlatılmamış!');
  }
};

export const stopNotificationSound = () => {
  if (notificationAudio) {
    try {
      console.log('Bildirim sesi durduruluyor...');
      notificationAudio.pause();
      notificationAudio.currentTime = 0;
      console.log('Bildirim sesi durduruldu!');
    } catch (error) {
      console.error('Bildirim sesi durdurulurken hata:', error);
    }
  }
}; 