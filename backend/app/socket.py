from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
from app import db
from app.models.message_model import Message
from app.controllers.user_controller import User
from backend.app.models.friendship_model import Friendship
from app.models.notification import Notification
from datetime import datetime, timedelta
from sqlalchemy import text

socketio = SocketIO(
    cors_allowed_origins=["http://localhost:3000"],
    ping_timeout=60,
    ping_interval=25,
    max_http_buffer_size=1e8
)

connected_users = {}

@socketio.on('connect')
def handle_connect():
    print(f"Bir kullanıcı bağlandı: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Kullanıcı ayrıldı: {request.sid}")
    user_to_remove = None
    for user_id, sid in connected_users.items():
        if sid == request.sid:
            user_to_remove = user_id
            break
    if user_to_remove:
        # Kullanıcıyı çevrimdışı yap
        user = User.query.get(user_to_remove)
        if user:
            user.is_online = False
            user.last_seen = datetime.utcnow() + timedelta(hours=3)
            db.session.commit()
            
            # Arkadaşlarına bildir
            friends = Friendship.query.filter(
                ((Friendship.user_id == user_to_remove) | (Friendship.friend_id == user_to_remove)) &
                (Friendship.status == 'accepted')
            ).all()
            
            for friendship in friends:
                friend_id = friendship.friend_id if friendship.user_id == user_to_remove else friendship.user_id
                emit('user_status_change', {
                    'user_id': user_to_remove,
                    'is_online': False,
                    'last_seen': user.last_seen.isoformat()
                }, room=str(friend_id))
        
        del connected_users[user_to_remove]
        leave_room(user_to_remove)
        print(f"Kullanıcı {user_to_remove} odadan çıkarıldı.")

@socketio.on('join')
def handle_join(data):
    user_id = str(data.get('user_id'))
    join_room(user_id)
    connected_users[user_id] = request.sid
    
    # Kullanıcıyı çevrimiçi yap
    user = User.query.get(user_id)
    if user:
        user.is_online = True
        user.last_seen = datetime.utcnow() + timedelta(hours=3)
        db.session.commit()
        
        # Arkadaşlarına bildir
        friends = Friendship.query.filter(
            ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
            (Friendship.status == 'accepted')
        ).all()
        
        for friendship in friends:
            friend_id = friendship.friend_id if friendship.user_id == user_id else friendship.user_id
            emit('user_status_change', {
                'user_id': user_id,
                'is_online': True,
                'last_seen': user.last_seen.isoformat()
            }, room=str(friend_id))
    
    print(f"Kullanıcı {user_id} odaya katıldı.")
    emit('system', {'message': f'Hoşgeldin kullanıcı {user_id}'}, room=user_id)

@socketio.on('get_online_status')
def handle_get_online_status(data):
    user_id = str(data.get('user_id'))
    online_users = list(connected_users.keys())
    
    # Kullanıcının arkadaşlarının durumlarını al
    friends = Friendship.query.filter(
        ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
        (Friendship.status == 'accepted')
    ).all()
    
    friend_statuses = []
    for friendship in friends:
        friend_id = friendship.friend_id if friendship.user_id == user_id else friendship.user_id
        friend = User.query.get(friend_id)
        if friend:
            friend_statuses.append({
                'user_id': friend_id,
                'is_online': friend.is_online,
                'last_seen': friend.last_seen.isoformat() if friend.show_last_seen else None
            })
    
    emit('online_users', {
        'online_users': online_users,
        'friend_statuses': friend_statuses
    }, room=user_id)

@socketio.on('send_message')
def handle_send_message(data):
    sender_id = str(data.get('sender_id'))
    receiver_id = str(data.get('receiver_id'))
    message = data.get('message')

    if not receiver_id or not message:
        emit('error', {'message': 'Hedef kullanıcı veya mesaj boş olamaz.'}, room=sender_id)
        return

    print(f"{sender_id} -> {receiver_id}: {message}")

    new_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=message,
        sent_at=datetime.utcnow() + timedelta(hours=3)
    )
    db.session.add(new_message)
    db.session.commit()

    emit('receive_message', {
        'id': new_message.id,
        'from': sender_id,
        'message': message
    }, room=receiver_id)

    emit('receive_message', {
        'id': new_message.id,
        'from': sender_id,
        'message': message
    }, room=sender_id)

def send_friend_request(to_user_id, from_user_id, from_username, friendship_id):
    print(f"Arkadaşlık isteği gönderiliyor: {from_user_id} -> {to_user_id}, friendship_id: {friendship_id}")
    
    # Bildirim sayısını al
    sql_count = text("""
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = :user_id AND is_read = 0 AND type = 'friend_request'
    """)
    result = db.session.execute(sql_count, {"user_id": to_user_id}).fetchone()
    unread_count = result.count if result else 0
    print(f"Okunmamış arkadaşlık isteği bildirimi sayısı: {unread_count}")

    # Eğer aynı kullanıcıdan bekleyen bir istek varsa, yeni bildirim oluşturma
    sql_check = text("""
        SELECT COUNT(*) as count 
        FROM notifications n
        JOIN friendships f ON f.id = :friendship_id
        WHERE n.user_id = :user_id 
        AND n.type = 'friend_request' 
        AND n.is_read = 0
        AND f.status = 'pending'
    """)
    existing_notification = db.session.execute(sql_check, {
        "user_id": to_user_id,
        "friendship_id": friendship_id
    }).fetchone()

    if not existing_notification or existing_notification.count == 0:
        # Bildirim oluştur
        sql_insert = text("""
            INSERT INTO notifications (user_id, type, content, is_read, created_at, friendship_id)
            VALUES (:user_id, 'friend_request', :content, 0, GETDATE(), :friendship_id)
        """)
        db.session.execute(sql_insert, {
            "user_id": to_user_id,
            "content": f"{from_username} size arkadaşlık isteği gönderdi.",
            "friendship_id": friendship_id
        })
        db.session.commit()
        print("Bildirim veritabanına kaydedildi")

        # Bildirim sayısını güncelle
        unread_count += 1
        print(f"Bildirim sayısı güncelleniyor: {to_user_id} -> {unread_count}")
        socketio.emit("notification_count", {"count": unread_count}, room=str(to_user_id))

    # Friendship ID'yi kontrol et
    if not friendship_id:
        print("HATA: Friendship ID eksik!")
        return

    # Alıcıya bildirim gönder
    print(f"Alıcıya bildirim gönderiliyor: {to_user_id}, friendship_id: {friendship_id}")
    socketio.emit("friend_request_received", {
        "to_user_id": str(to_user_id),
        "from_user_id": str(from_user_id),
        "from_username": from_username,
        "friendship_id": int(friendship_id)  # Integer olarak gönder
    }, room=str(to_user_id))

    # Gönderene bildirim gönder
    to_user = db.session.execute(text("SELECT username FROM users WHERE id = :id"), {"id": to_user_id}).fetchone()
    print(f"Gönderene bildirim gönderiliyor: {from_user_id}, friendship_id: {friendship_id}")
    socketio.emit("friend_request_sent", {
        "from_user_id": str(from_user_id),
        "to_user_id": str(to_user_id),
        "to_username": to_user.username,
        "friendship_id": int(friendship_id)  # Integer olarak gönder
    }, room=str(from_user_id))

    print("Tüm bildirimler gönderildi")

def send_friend_request_accepted(user_id, friend_id, friend_username):
    # Arkadaşlık isteği kabul edildiğinde bildirim gönder
    socketio.emit("friend_request_accepted", {
        "user_id": user_id,
        "friend_id": friend_id,
        "friend_username": friend_username
    }, room=str(user_id))

@socketio.on('get_notifications')
def handle_get_notifications(data):
    user_id = str(data.get('user_id'))
    
    # Okunmamış bildirimleri getir
    sql_notifications = text("""
        SELECT * FROM notifications 
        WHERE user_id = :user_id AND is_read = 0 
        ORDER BY created_at DESC
    """)
    notifications = db.session.execute(sql_notifications, {"user_id": user_id}).fetchall()
    
    notification_list = []
    for notification in notifications:
        notification_list.append({
            'id': notification.id,
            'type': notification.type,
            'content': notification.content,
            'created_at': notification.created_at.isoformat() if notification.created_at else None
        })
    
    emit('notifications', {
        'notifications': notification_list
    }, room=user_id)

@socketio.on('mark_notification_read')
def handle_mark_notification_read(data):
    notification_id = data.get('notification_id')
    friendship_id = data.get('friendship_id')
    user_id = data.get('user_id')
    
    print(f"Bildirim okundu olarak işaretleniyor: notification_id={notification_id}, friendship_id={friendship_id}, user_id={user_id}")
    
    try:
        # Bildirimi okundu olarak işaretle
        sql_update = text("""
            UPDATE notifications 
            SET is_read = 1 
            WHERE id = :notification_id AND user_id = :user_id
        """)
        db.session.execute(sql_update, {
            "notification_id": notification_id,
            "user_id": user_id
        })
        
        # Okunmamış bildirim sayısını güncelle
        sql_count = text("""
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = :user_id AND is_read = 0 AND type = 'friend_request'
        """)
        result = db.session.execute(sql_count, {"user_id": user_id}).fetchone()
        unread_count = result.count if result else 0
        
        db.session.commit()
        
        # Güncel bildirim sayısını gönder
        socketio.emit("notification_count", {"count": unread_count}, room=str(user_id))
        print(f"Bildirim okundu olarak işaretlendi. Yeni okunmamış bildirim sayısı: {unread_count}")
        
    except Exception as e:
        print(f"Bildirim güncellenirken hata oluştu: {str(e)}")
        db.session.rollback()
        emit('error', {'message': 'Bildirim güncellenirken bir hata oluştu'})

@socketio.on('mark_all_notifications_read')
def handle_mark_all_notifications_read(data):
    user_id = str(data.get('user_id'))
    
    # Tüm bildirimleri okundu olarak işaretle
    sql_update = text("""
        UPDATE notifications 
        SET is_read = 1 
        WHERE user_id = :user_id AND is_read = 0
    """)
    db.session.execute(sql_update, {"user_id": user_id})
    db.session.commit()
    
    # Bildirim sayısını sıfırla
    emit('notification_count', {
        'count': 0
    }, room=user_id)

@socketio.on('delete_message')
def handle_delete_message(data):
    message_id = data.get('message_id')
    user_id = str(data.get('user_id'))
    if not message_id or not user_id:
        return
    # Mesajı bul
    message = Message.query.filter_by(id=message_id).first()
    if not message:
        return
    sender_id = str(message.sender_id)
    receiver_id = str(message.receiver_id)
    # Mesajı sil
    db.session.delete(message)
    db.session.commit()
    # Hem gönderenin hem alıcının odasına emit et
    socketio.emit('message_deleted', {
        'message_id': message_id,
        'deleted_by': user_id
    }, room=sender_id)
    socketio.emit('message_deleted', {
        'message_id': message_id,
        'deleted_by': user_id
    }, room=receiver_id)
