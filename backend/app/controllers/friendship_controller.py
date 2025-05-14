from flask import request, jsonify
from app import db
from app import socketio
from app.socket import send_friend_request
from app.models.friendship_model import Friendship
from app.models.user_model import User


class FriendshipController:
    @staticmethod
    def add_friend():
        data = request.get_json()
        user_id = data.get('user_id')
        friend_id = data.get('friend_id')
    
        print(f"Arkadaşlık isteği gönderiliyor: {user_id} -> {friend_id}")
    
        if not user_id or not friend_id:
            print("Eksik bilgi: user_id veya friend_id")
            return jsonify({'error': 'Eksik bilgi'}), 400
    
        if user_id == friend_id:
            print("Kullanıcı kendini eklemeye çalışıyor")
            return jsonify({'error': 'Kendinizi arkadaş olarak ekleyemezsiniz.'}), 400
    
        try:
        
            result = Friendship.check_pending_request(user_id, friend_id)
    
            if result == True:
                print("Zaten bekleyen bir istek var")
                return jsonify({'error': 'Zaten bekleyen bir arkadaşlık isteği var.'}), 409
    
            # Yeni arkadaşlık isteği oluştur
            Friendship.get_friendship_requests(user_id, friend_id)
    
            # Oluşturulan kaydın ID'sini al
            result = Friendship.get_friendship_id(user_id, friend_id)
    
            if not result:
                print("Friendship ID alınamadı")
                db.session.rollback()
                return jsonify({'error': 'Arkadaşlık isteği oluşturulamadı'}), 500
    
            friendship_id = result.id
            print(f"Arkadaşlık isteği oluşturuldu, ID: {friendship_id}")
    
            # Gönderen kullanıcının bilgilerini al
            user = Friendship.get_sender_info(user_id)
            
            if not user:
                print("Gönderen kullanıcı bulunamadı")
                db.session.rollback()
                return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
    
            # Socket bildirimlerini gönder
            print(f"Socket bildirimleri gönderiliyor: friendship_id={friendship_id}")
            send_friend_request(friend_id, user_id, user.username, friendship_id)
    
            return jsonify({
                'message': 'Arkadaşlık isteği gönderildi.',
                'friendship_id': friendship_id,
                'friend_id': friend_id
            }), 201
    
        except Exception as e:
            print(f"Arkadaşlık isteği gönderilirken hata oluştu: {str(e)}")
            db.session.rollback()
            return jsonify({'error': f'Arkadaşlık isteği gönderilirken bir hata oluştu: {str(e)}'}), 500
    
    @staticmethod
    def accept_friend():
        data = request.get_json()
        friendship_id = data.get('friendship_id')
    
        result = Friendship.check_friendship(friendship_id)
    
        if not result:
            return jsonify({'error': 'Arkadaşlık isteği bulunamadı veya geçersiz.'}), 404
    
        Friendship.accept_friendship(friendship_id)
    
        user_id = str(result.user_id)
        friend_id = str(result.friend_id)
    
        # Socket.IO bildirimleri
        print(f"Arkadaşlık kabul edildi: {user_id} <-> {friend_id}")
        
        # Her iki kullanıcıya da friend_added event'i gönder
        socketio.emit("friend_added", {
            "user_id": user_id,
            "friend_id": friend_id,
            "status": "accepted"
        }, room=user_id)
        
        socketio.emit("friend_added", {
            "user_id": friend_id,
            "friend_id": user_id,
            "status": "accepted"
        }, room=friend_id)
        
        # İstek listelerini güncellemek için event'ler
        socketio.emit("friend_request_handled", {
            "friendship_id": friendship_id,
            "status": "accepted",
            "user_id": user_id,
            "friend_id": friend_id
        }, room=user_id)
        
        socketio.emit("friend_request_handled", {
            "friendship_id": friendship_id,
            "status": "accepted",
            "user_id": user_id,
            "friend_id": friend_id
        }, room=friend_id)
    
        return jsonify({'message': 'Arkadaşlık isteği kabul edildi.'}), 200
    
    @staticmethod
    def reject_friend():
        data = request.get_json()
        friendship_id = data.get('friendship_id')
        
        print(f"Arkadaşlık isteği reddediliyor. Friendship ID: {friendship_id}")
        print(f"Gelen data: {data}")
    
        if not friendship_id:
            print("Friendship ID eksik")
            return jsonify({'error': 'Friendship ID gerekli'}), 400
    
        result = Friendship.check_friendship(friendship_id)
    
        if not result:
            print(f"Arkadaşlık isteği bulunamadı. ID: {friendship_id}")
            return jsonify({'error': 'Arkadaşlık isteği bulunamadı veya geçersiz.'}), 404
    
        user_id = str(result.user_id)
        friend_id = str(result.friend_id)
    
        print(f"Arkadaşlık isteği reddediliyor: {user_id} <-> {friend_id}")
    
        Friendship.reject_friendship(friendship_id)
    
        print("Arkadaşlık isteği veritabanından silindi")
    
        socketio.emit("friend_request_handled", {
            "friendship_id": friendship_id,
            "status": "rejected",
            "user_id": user_id,
            "friend_id": friend_id
        }, room=user_id)
        
        socketio.emit("friend_request_handled", {
            "friendship_id": friendship_id,
            "status": "rejected",
            "user_id": user_id,
            "friend_id": friend_id
        }, room=friend_id)
    
        print("Socket event'leri gönderildi")
        return jsonify({'message': 'Arkadaşlık isteği reddedildi.'}), 200
    
    @staticmethod
    def remove_friend():
        data = request.get_json()
        user_id = data.get('user_id')
        friend_id = data.get('friend_id')
    
        result = Friendship.check_friendship_status(user_id, friend_id)
    
        if not result:
            return jsonify({'error': 'Arkadaşlık bulunamadı.'}), 404
    
        # Silme öncesi status'u kontrol et
        silinen_status = result.status
        if silinen_status == 'pending':
            print(f"[LOG] Bu bir REJECT (istek reddi) olarak loglanacak. user_id={user_id}, friend_id={friend_id}")
        else:
            print(f"[LOG] Bu bir normal arkadaş silme işlemi olarak loglanacak. user_id={user_id}, friend_id={friend_id}")
    
        Friendship.remove_friendship(user_id, friend_id)
    
        return jsonify({'message': 'Arkadaş silindi.'}), 200
    
    @staticmethod
    def list_friends(user_id):
        result = Friendship.get_friendship_list(user_id)
    
        friend_list = []
        for f in result:
            friend_user_id = f.friend_id if f.user_id == user_id else f.user_id
    
            user = User.get_profile(friend_user_id)
    
            friend_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email
            })
    
        return jsonify({'friends': friend_list}), 200
    
    @staticmethod
    def pending_requests(user_id):
        result = Friendship.get_pending_requests(user_id)
    
        requests = []
        for req in result:
            user = User.get_profile(req.user_id)
    
            requests.append({
                'friendship_id': req.id,
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            })
    
        return jsonify({'requests': requests}), 200
    
    @staticmethod
    def sent_requests(user_id):
    
        result = Friendship.sent_requests(user_id)
    
        requests = []
        for req in result:
            user = User.get_profile(req.friend_id)
    
            requests.append({
                'friendship_id': req.id,
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            })
    
        return jsonify({'requests': requests}), 200
    
    @staticmethod
    def cancel_friend_request():
        data = request.get_json()
        user_id = data.get('user_id')
        friend_id = data.get('friend_id')
    
        if not user_id or not friend_id:
            return jsonify({'error': 'Eksik bilgi'}), 400
    
        result = Friendship.check_cancel_request(user_id, friend_id)
    
        if not result:
            return jsonify({'error': 'İptal edilecek istek bulunamadı.'}), 404
    
        Friendship.cancel_request(user_id, friend_id)
    
        from app.socket import socketio
        socketio.emit("friend_request_cancelled", {
            "from_user_id": user_id
        }, room=str(friend_id))
    
        return jsonify({'message': 'Arkadaşlık isteği iptal edildi.'}), 200
    