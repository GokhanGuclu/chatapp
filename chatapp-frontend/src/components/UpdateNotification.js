import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    // Electron ortamında mıyız kontrol et
    if (!window.electron?.ipcRenderer) {
      console.log('Electron ortamında değiliz, güncelleme bildirimleri devre dışı.');
      return;
    }

    const ipcRenderer = window.electron.ipcRenderer;

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
      toast('Yeni bir güncelleme mevcut! İndiriliyor...', {
        duration: 4000,
      });
    };

    const handleUpdateDownloaded = () => {
      setUpdateDownloaded(true);
      toast.success('Güncelleme indirildi! Uygulamayı yeniden başlatmak için tıklayın.', {
        duration: 6000,
        onClick: () => {
          ipcRenderer.send('restart_app');
        },
      });
    };

    ipcRenderer.on('update_available', handleUpdateAvailable);
    ipcRenderer.on('update_downloaded', handleUpdateDownloaded);

    return () => {
      if (ipcRenderer) {
        ipcRenderer.removeListener('update_available', handleUpdateAvailable);
        ipcRenderer.removeListener('update_downloaded', handleUpdateDownloaded);
      }
    };
  }, []);

  return null;
};

export default UpdateNotification; 