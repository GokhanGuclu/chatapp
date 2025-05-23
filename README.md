# ChatApp - Gerçek Zamanlı Mesajlaşma Uygulaması

Modern ve kullanıcı dostu bir gerçek zamanlı mesajlaşma uygulaması. Electron tabanlı masaüstü uygulaması ve web arayüzü desteği ile hem masaüstünde hem de tarayıcıda kullanılabilir.

## 🚀 Özellikler

### Genel Özellikler
- Gerçek zamanlı mesajlaşma
- Kullanıcı dostu arayüz
- Masaüstü uygulaması (Electron) ve web desteği
- Özel pencere kontrolü (minimize, maximize, close)
- Responsive tasarım
- Gerçek zamanlı bildirim sistemi

### Mesajlaşma Özellikleri
- Birebir mesajlaşma
- Mesaj geçmişi
- Mesaj silme
- Sohbet silme
- Çevrimiçi/çevrimdışı durumu
- Son görülme zamanı
- Okundu bilgisi
- Mesaj bildirimleri

### Kullanıcı Özellikleri
- Kullanıcı kaydı ve girişi
- Arkadaş ekleme/silme
- Arkadaş listesi
- Profil ayarları
- Profil resmi desteği
- Arkadaşlık isteği bildirimleri
- Bildirim yönetimi (okundu/okunmadı)
- Bildirim geçmişi

### Bildirim Sistemi
- Gerçek zamanlı bildirimler
- Farklı bildirim türleri (mesaj, arkadaşlık isteği)
- Bildirim sayacı
- Bildirim okundu/okunmadı durumu
- Bildirim geçmişi görüntüleme
- Tüm bildirimleri okundu olarak işaretleme
- Bildirim detayları (gönderen, zaman, içerik)

## 🛠️ Teknolojiler

### Backend
- Python 3.x
- Flask (Web Framework)
- Flask-SocketIO (Gerçek zamanlı iletişim)
- SQLAlchemy (ORM)
- SQL Server (Veritabanı)
- Flask-CORS (CORS desteği)
- T-SQL Stored Procedures
- WebSocket desteği

### Frontend
- React.js
- React Router (Sayfa yönlendirme)
- Socket.IO Client (Gerçek zamanlı iletişim)
- Electron (Masaüstü uygulaması)
- React Icons
- React Hot Toast (Bildirimler)

## 📦 Proje Kurulumu

### 1. Gereksinimler
- **Sistem Gereksinimleri**
  - Windows 10 veya üzeri
  - En az 4GB RAM
  - 1GB boş disk alanı
  - İnternet bağlantısı

- **Yazılım Gereksinimleri**
  - Git (v2.x veya üzeri)
  - Python 3.x
  - Node.js (v16 veya üzeri)
  - npm (Node.js ile birlikte gelir)
  - SQL Server (2019 veya üzeri)
  - Visual Studio Code (önerilen)

### 2. Projeyi İndirme
```bash
# Projeyi klonlayın
git clone https://github.com/GokhanGuclu/chatapp.git

# Proje klasörüne girin
cd chatapp
```

### 3. Backend Kurulumu
1. **Backend Klasörüne Geçiş**
   ```bash
   cd backend
   ```

2. **Python Sanal Ortam Oluşturma**
   ```bash
   # Windows için
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac için
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Bağımlılıkları Yükleme**
   ```bash
   pip install -r requirements.txt
   ```

4. **Veritabanı Kurulumu**
   - SQL Server'ın çalıştığından emin olun
   - Veritabanı bağlantı bilgilerini `config.py` dosyasında kontrol edin
   - Gerekirse `.env` dosyası oluşturun

5. **Backend'i Başlatma**
   ```bash
   python run.py
   # Sunucu http://localhost:5000 adresinde çalışacak
   ```

### 4. Frontend Kurulumu
1. **Frontend Klasörüne Geçiş**
   ```bash
   cd ../chatapp-frontend
   ```

2. **Bağımlılıkları Yükleme**
   ```bash
   npm install
   ```

3. **Geliştirme Modunda Çalıştırma**
   ```bash
   # Web uygulaması olarak çalıştırma
   npm start
   # http://localhost:3000 adresinde açılacak

   # Electron uygulaması olarak çalıştırma
   npm run electron-dev
   ```

4. **Üretim Sürümü Oluşturma**
   ```bash
   # Web uygulaması için
   npm run build

   # Electron uygulaması için
   npm run electron-pack
   ```

### 5. Proje Yapısı
```
chatapp/
├── backend/                 # Backend uygulaması
│   ├── app/                # Uygulama kodları
│   │   ├── models/        # Veritabanı modelleri
│   │   ├── routes/        # API rotaları
│   │   ├── controllers/   # İş mantığı
│   │   └── socket.py      # WebSocket işlemleri
│   ├── config.py          # Yapılandırma
│   ├── requirements.txt   # Python bağımlılıkları
│   └── run.py            # Başlatma dosyası
│
├── chatapp-frontend/       # Frontend uygulaması
│   ├── public/            # Statik dosyalar
│   │   ├── electron.js    # Electron ana süreç
│   │   └── preload.js     # Electron önyükleme
│   ├── src/              # Kaynak kodlar
│   │   ├── components/   # React bileşenleri
│   │   ├── pages/       # Sayfa bileşenleri
│   │   ├── context/     # React context'leri
│   │   └── utils/       # Yardımcı fonksiyonlar
│   └── package.json     # Node.js bağımlılıkları
│
└── README.md             # Proje dokümantasyonu
```

### 6. Geliştirme Ortamı
- **Backend Geliştirme**
  - Python IDE (VS Code önerilen)
  - SQL Server Management Studio
  - Postman (API testi için)

- **Frontend Geliştirme**
  - VS Code eklentileri:
    - ESLint
    - Prettier
    - React Developer Tools
    - Redux DevTools

### 7. Sık Karşılaşılan Sorunlar ve Çözümleri

#### Backend Sorunları
- **Veritabanı Bağlantı Hatası**
  - SQL Server servisinin çalıştığından emin olun
  - Bağlantı bilgilerini kontrol edin
  - Firewall ayarlarını kontrol edin

- **Port Çakışması**
  - 5000 portu kullanımdaysa:
    ```bash
    set FLASK_RUN_PORT=5001
    python run.py
    ```

#### Frontend Sorunları
- **Node Modülleri Hatası**
  ```bash
  rm -rf node_modules
  npm install
  ```

- **Port Çakışması**
  ```bash
  # 3000 portu kullanımdaysa
  set PORT=3001 && npm start
  ```

- **Electron Build Hatası**
  ```bash
  npm run build
  npm run electron-pack
  ```

#### Bildirim Sistemi Sorunları
- **Bildirimler Görünmüyor**
  - WebSocket bağlantısını kontrol edin
  - Kullanıcı oturumunun aktif olduğundan emin olun
  - Tarayıcı konsolunda hata mesajlarını kontrol edin

- **Bildirim Sayacı Güncellenmiyor**
  - Socket.IO bağlantısını yeniden başlatın
  - Sayfayı yenileyin
  - Kullanıcı oturumunu kapatıp tekrar açın

- **Bildirimler Okundu Olarak İşaretlenmiyor**
  - Veritabanı bağlantısını kontrol edin
  - API endpoint'lerinin doğru çalıştığından emin olun
  - Kullanıcı yetkilerini kontrol edin

### 8. Test ve Doğrulama
1. **Backend Testi**
   ```bash
   cd backend
   python -m pytest
   ```

2. **Frontend Testi**
   ```bash
   cd chatapp-frontend
   npm test
   ```

3. **Manuel Test**
   - Backend API'lerini Postman ile test edin
   - Web uygulamasını farklı tarayıcılarda test edin
   - Electron uygulamasını test edin

### 9. Deployment (Dağıtım)
1. **Backend Deployment**
   - Python sanal ortamı oluşturun
   - Bağımlılıkları yükleyin
   - Gunicorn veya uWSGI ile sunucu başlatın
   - Nginx veya Apache ile reverse proxy yapılandırın

2. **Frontend Deployment**
   - Web uygulaması için:
     ```bash
     npm run build
     # build klasörünü web sunucusuna yükleyin
     ```
   - Electron uygulaması için:
     ```bash
     npm run electron-pack
     # dist klasöründeki kurulum dosyasını dağıtın
     ```

## 🚀 Kullanım

### Web Uygulaması
1. Backend'i başlatın (`python run.py`)
2. Frontend'i başlatın (`npm start`)
3. Tarayıcıda `http://localhost:3000` adresine gidin

### Masaüstü Uygulaması
1. Backend'i başlatın (`python run.py`)
2. Masaüstü uygulamasını başlatın:
   ```bash
   npm run electron-dev
   ```

## 📝 API Endpoints

### Kullanıcı İşlemleri (`/user`)
- `POST /user/register` - Yeni kullanıcı kaydı
- `POST /user/login` - Kullanıcı girişi
- `GET /user/get_by_username/<username>` - Kullanıcı adına göre kullanıcı bilgisi
- `GET /user/get_profile/<user_id>` - Kullanıcı profili
- `PUT /user/update_status/<user_id>` - Kullanıcı durumunu güncelleme (çevrimiçi/çevrimdışı)
- `PUT /user/update_last_seen/<user_id>` - Son görülme zamanını güncelleme
- `PUT /user/toggle_last_seen/<user_id>` - Son görülme özelliğini açma/kapama
- `GET /user/get_user_status/<user_id>` - Kullanıcı durumu bilgisi
- `GET /user/get_friends_status/<user_id>` - Arkadaşların durum bilgileri

### Arkadaşlık İşlemleri (`/friendship`)
- `POST /friendship/add` - Arkadaş ekleme isteği gönderme
- `GET /friendship/list/<user_id>` - Arkadaş listesi
- `GET /friendship/pending/<user_id>` - Bekleyen arkadaşlık istekleri
- `GET /friendship/sent/<user_id>` - Gönderilen arkadaşlık istekleri
- `DELETE /friendship/remove` - Arkadaşlığı sonlandırma

### Mesaj İşlemleri (`/message`)
- `GET /message/history/<user_id>/<friend_id>` - İki kullanıcı arasındaki mesaj geçmişi
- `GET /message/active_chats/<user_id>` - Aktif sohbetler
- `DELETE /message/<message_id>` - Mesaj silme
- `DELETE /message/chat/<user_id>/<friend_id>` - Sohbet silme

### Bildirim İşlemleri (`/notification`)
- `GET /notification/get_notifications/<user_id>` - Kullanıcının tüm bildirimlerini getir
- `POST /notification/mark_read/<notification_id>/<user_id>` - Bildirimi okundu olarak işaretle
- `POST /notification/mark_all_read/<user_id>` - Tüm bildirimleri okundu olarak işaretle
- `GET /notification/unread_count/<user_id>` - Okunmamış bildirim sayısını getir
- `DELETE /notification/delete/<notification_id>` - Bildirimi sil

### WebSocket Events
- `connect` - Bağlantı kurma
- `disconnect` - Bağlantı kesme
- `join` - Odaya katılma
- `leave` - Odadan ayrılma
- `send_message` - Mesaj gönderme
- `receive_message` - Mesaj alma
- `message_deleted` - Mesaj silme bildirimi
- `chat_deleted` - Sohbet silme bildirimi
- `get_notifications` - Bildirim sayısını alma
- `notification_count` - Bildirim sayısı güncelleme
- `receive_notification` - Yeni bildirim alma
- `notification_read` - Bildirim okundu bildirimi
- `friend_request_received` - Arkadaşlık isteği alma
- `friend_request_sent` - Arkadaşlık isteği gönderme
- `friend_request_accepted` - Arkadaşlık isteği kabul edildi bildirimi

### API İstek Formatları

#### Kullanıcı Kaydı
```json
POST /user/register
{
    "username": "string",
    "email": "string",
    "password": "string",
    "display_name": "string"
}
```

#### Kullanıcı Girişi
```json
POST /user/login
{
    "email": "string",
    "password": "string"
}
```

#### Arkadaş Ekleme
```json
POST /friendship/add
{
    "user_id": "integer",
    "friend_id": "integer"
}
```

#### Mesaj Gönderme (WebSocket)
```json
{
    "sender_id": "integer",
    "receiver_id": "integer",
    "content": "string"
}
```

#### Bildirim İşaretleme
```json
POST /notification/mark_read/<notification_id>/<user_id>
{
    "notification_id": "integer",
    "user_id": "integer"
}
```

#### Tüm Bildirimleri İşaretleme
```json
POST /notification/mark_all_read/<user_id>
{
    "user_id": "integer"
}
```

#### Bildirim Silme
```json
DELETE /notification/delete/<notification_id>
{
    "notification_id": "integer",
    "user_id": "integer"
}
```

### API Yanıt Formatları

#### Başarılı Yanıt
```json
{
    "status": "success",
    "message": "İşlem başarılı",
    "data": { ... }
}
```

#### Hata Yanıtı
```json
{
    "status": "error",
    "message": "Hata mesajı",
    "error_code": "integer"
}
```

#### Başarılı Bildirim Yanıtı
```json
{
    "status": "success",
    "notifications": [
        {
            "id": "integer",
            "type": "string",
            "content": "string",
            "is_read": "boolean",
            "created_at": "datetime",
            "sender_username": "string",
            "sender_profile_picture": "string"
        }
    ]
}
```

#### Bildirim Sayacı Yanıtı
```json
{
    "status": "success",
    "count": "integer"
}
```

## 🔒 Güvenlik
- CORS koruması
- SQL injection koruması
- XSS koruması
- Güvenli şifreleme
- Oturum yönetimi

## 🤝 Projeye Katkıda Bulunma

Bu projeye katkıda bulunmak isterseniz, aşağıdaki adımları izleyebilirsiniz:

1. **Projeyi Fork Edin**
   - GitHub'da projenin sayfasına gidin
   - Sağ üstteki "Fork" butonuna tıklayın
   - Bu işlem projenin bir kopyasını kendi hesabınıza oluşturacak

2. **Geliştirme Ortamını Hazırlayın**
   - Fork ettiğiniz projeyi bilgisayarınıza indirin:
     ```bash
     git clone https://github.com/GokhanGuclu/chatapp.git
     ```
   - Proje klasörüne gidin:
     ```bash
     cd chatapp
     ```
   - Yeni bir geliştirme dalı (branch) oluşturun:
     ```bash
     git checkout -b yeni-ozellik
     ```

3. **Değişikliklerinizi Yapın**
   - Kodunuzu düzenleyin
   - Yeni özellikler ekleyin
   - Hataları düzeltin
   - Kodunuzu test edin

4. **Değişikliklerinizi Gönderin**
   - Değişikliklerinizi commit edin:
     ```bash
     git add .
     git commit -m "Yeni özellik: [özelliğin kısa açıklaması]"
     ```
   - Değişikliklerinizi GitHub'a gönderin:
     ```bash
     git push origin yeni-ozellik
     ```

5. **Pull Request Oluşturun**
   - GitHub'da fork ettiğiniz projenin sayfasına gidin
   - "Pull Request" butonuna tıklayın
   - Değişikliklerinizi açıklayan bir başlık ve detaylı açıklama yazın
   - "Create Pull Request" butonuna tıklayın

### Katkıda Bulunurken Dikkat Edilecekler

- Kod yazarken mevcut kod stilini takip edin
- Yeni özellikler eklerken dokümantasyonu güncelleyin
- Test yazmayı unutmayın
- Commit mesajlarınızı açıklayıcı yazın
- Büyük değişiklikler yapmadan önce bir issue açın ve tartışın

### Geliştirme Kuralları

1. **Kod Stili**
   - Python için PEP 8 standartlarını takip edin
   - JavaScript/React için ESLint kurallarına uyun
   - Değişken ve fonksiyon isimleri anlamlı olsun
   - Kodunuzu yorum satırlarıyla açıklayın

2. **Commit Mesajları**
   - Türkçe veya İngilizce yazabilirsiniz
   - Mesajın ilk satırı kısa ve öz olsun
   - Gerekirse detaylı açıklama ekleyin
   - Örnek: "feat: Kullanıcı profil resmi yükleme özelliği eklendi"

3. **Pull Request'ler**
   - Başlık açıklayıcı olsun
   - Yapılan değişiklikleri detaylı açıklayın
   - Varsa ilgili issue'ları belirtin

## 📄 Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim
Gökhan Güçlü - [@github](https://github.com/GokhanGouclu) - [@email](gokanguclu@outlook.com)

Proje Linki: [https://github.com/Gokhanguclu/chatapp](https://github.com/GokhanGuclu/chatapp)
