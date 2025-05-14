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

### WebSocket Events
- `connect` - Bağlantı kurma
- `disconnect` - Bağlantı kesme
- `join` - Odaya katılma
- `leave` - Odadan ayrılma
- `send_message` - Mesaj gönderme
- `receive_message` - Mesaj alma
- `message_deleted` - Mesaj silme bildirimi
- `chat_deleted` - Sohbet silme bildirimi

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
   - Ekran görüntüleri veya test sonuçları ekleyin

## 📄 Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim
Gökhan Güçlü - [@github](https://github.com/GokhanGouclu) - [@email](gokanguclu@outlook.com)

Proje Linki: [https://github.com/Gokhanguclu/chatapp](https://github.com/GokhanGuclu/chatapp)
