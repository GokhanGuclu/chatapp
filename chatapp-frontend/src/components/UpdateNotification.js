import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const { ipcRenderer } = window.require('electron');

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    ipcRenderer.on('update_available', () => {
      setUpdateAvailable(true);
      toast('Yeni bir güncelleme mevcut! İndiriliyor...', {
        duration: 4000,
      });
    });

    ipcRenderer.on('update_downloaded', () => {
      setUpdateDownloaded(true);
      toast.success('Güncelleme indirildi! Uygulamayı yeniden başlatmak için tıklayın.', {
        duration: 6000,
        onClick: () => {
          ipcRenderer.send('restart_app');
        },
      });
    });

    return () => {
      ipcRenderer.removeAllListeners('update_available');
      ipcRenderer.removeAllListeners('update_downloaded');
    };
  }, []);

  return null;
};

export default UpdateNotification; 