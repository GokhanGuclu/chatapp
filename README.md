# ChatApp - Gerçek Zamanlı Mesajlaşma Uygulaması

Modern ve kullanıcı dostu bir gerçek zamanlı mesajlaşma uygulaması. Electron tabanlı masaüstü uygulaması ve web arayüzü desteği ile hem masaüstünde hem de tarayıcıda kullanılabilir.

## 🚀 Özellikler

### Genel Özellikler
- Gerçek zamanlı mesajlaşma
- Kullanıcı dostu arayüz
- Masaüstü uygulaması (Electron) ve web desteği
- Özel pencere kontrolü (minimize, maximize, close)
- Responsive tasarım

### Mesajlaşma Özellikleri
- Birebir mesajlaşma
- Mesaj geçmişi
- Mesaj silme
- Sohbet silme
- Çevrimiçi/çevrimdışı durumu
- Son görülme zamanı

### Kullanıcı Özellikleri
- Kullanıcı kaydı ve girişi
- Arkadaş ekleme/silme
- Arkadaş listesi
- Profil ayarları
- Profil resmi desteği

## 🛠️ Teknolojiler

### Backend
- Python 3.x
- Flask (Web Framework)
- Flask-SocketIO (Gerçek zamanlı iletişim)
- SQLAlchemy (ORM)
- SQL Server (Veritabanı)
- Flask-CORS (CORS desteği)

### Frontend
- React.js
- React Router (Sayfa yönlendirme)
- Socket.IO Client (Gerçek zamanlı iletişim)
- Electron (Masaüstü uygulaması)
- React Icons
- React Hot Toast (Bildirimler)

## 📦 Kurulum

### Backend Kurulumu
1. Python 3.x'i yükleyin
2. Backend klasörüne gidin:
   ```bash
   cd backend
   ```
3. Gerekli paketleri yükleyin:
   ```bash
   pip install -r requirements.txt
   ```
4. Veritabanı bağlantısını yapılandırın (`config.py`)
5. Uygulamayı başlatın:
   ```bash
   python run.py
   ```

### Frontend Kurulumu
1. Node.js'i yükleyin
2. Frontend klasörüne gidin:
   ```bash
   cd chatapp-frontend
   ```
3. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
4. Geliştirme modunda başlatın:
   ```bash
   npm start
   ```
5. Masaüstü uygulaması olarak başlatmak için:
   ```bash
   npm run electron-dev
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

### Kullanıcı İşlemleri
- `POST /user/register` - Yeni kullanıcı kaydı
- `POST /user/login` - Kullanıcı girişi
- `GET /user/profile/<user_id>` - Kullanıcı profili
- `PUT /user/profile/<user_id>` - Profil güncelleme

### Arkadaşlık İşlemleri
- `POST /friendship/add` - Arkadaş ekleme
- `DELETE /friendship/remove` - Arkadaş silme
- `GET /friendship/list/<user_id>` - Arkadaş listesi

### Mesaj İşlemleri
- `GET /message/history/<user_id>/<friend_id>` - Mesaj geçmişi
- `DELETE /message/<message_id>` - Mesaj silme
- `DELETE /message/chat/<user_id>/<friend_id>` - Sohbet silme

### WebSocket Events
- `connect` - Bağlantı kurma
- `disconnect` - Bağlantı kesme
- `join` - Odaya katılma
- `leave` - Odadan ayrılma
- `send_message` - Mesaj gönderme
- `receive_message` - Mesaj alma
- `message_deleted` - Mesaj silme bildirimi
- `chat_deleted` - Sohbet silme bildirimi

## 🔒 Güvenlik
- CORS koruması
- SQL injection koruması
- XSS koruması
- Güvenli şifreleme
- Oturum yönetimi

## 🤝 Katkıda Bulunma
1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim
Gökhan Güçlü - [@github](https://github.com/yourusername)

Proje Linki: [https://github.com/yourusername/chatapp](https://github.com/yourusername/chatapp)
