from flask import request
from flask_socketio import emit, join_room, leave_room
from app import socketio, db
from app.models.message_model import Message
from flask import jsonify
from sqlalchemy import text

class MessageController:

    @socketio.on('join')
    @staticmethod
    def handle_join(data):
        user_id = data.get('user_id')
        join_room(str(user_id))
        emit('status', {'message': f'User {user_id} joined room.'}, room=str(user_id))

    @socketio.on('leave')
    @staticmethod
    def handle_leave(data):
        user_id = data.get('user_id')
        leave_room(str(user_id))
        emit('status', {'message': f'User {user_id} left room.'}, room=str(user_id))

    @socketio.on('send_message')
    @staticmethod
    def handle_send_message(data):
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        content = data.get('content')

        if not sender_id or not receiver_id or not content:
            emit('error', {'error': 'Eksik bilgi'}, room=str(sender_id))
            return

        message = Message.send_message(sender_id, receiver_id, content)

        message_data = {
            'id': message.id,
            'sender_id': sender_id,
            'receiver_id': receiver_id,
            'content': content,
            'sent_at': str(message.sent_at)
        }

        emit('receive_message', message_data, room=str(sender_id))
        
        emit('receive_message', message_data, room=str(receiver_id))

    @staticmethod
    def get_message_history(user_id, friend_id):
        try:
            messages = Message.get_messages(user_id, friend_id)
            
            message_list = []
            for msg in messages:
                message_list.append({
                    'id': msg.id,
                    'sender_id': msg.sender_id,
                    'receiver_id': msg.receiver_id,
                    'content': msg.content,
                    'sent_at': msg.sent_at.isoformat() if msg.sent_at else None
                })

            return jsonify({
                'status': 'success',
                'messages': message_list
            }), 200
        except Exception as e:
            print(f"Mesaj geçmişi alınırken hata: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Mesaj geçmişi alınırken bir hata oluştu'
            }), 500

    @staticmethod
    def get_active_chats(user_id):
        result = db.session.execute(
            """
            SELECT * FROM active_friends_view WHERE user_id = :user_id
            """, {'user_id': user_id}
        )
        friends = []
        for row in result:
            friends.append({
                'id': row.friend_id,
                'username': getattr(row, 'friend_username', None),
                'status': getattr(row, 'friendship_status', None)
            })
        return jsonify({'active_friends': friends})

    @staticmethod
    def activate_chat():
        data = request.json
        user_id = data['user_id']
        friend_id = data['friend_id']

        existing = db.session.execute(
            """
            SELECT * FROM active_chats WHERE user_id = :user_id AND friend_id = :friend_id
            """, {'user_id': user_id, 'friend_id': friend_id}
        ).fetchone()

        if existing:
            db.session.execute(
                """
                UPDATE active_chats SET is_active = 1, last_action = GETDATE()
                WHERE user_id = :user_id AND friend_id = :friend_id
                """, {'user_id': user_id, 'friend_id': friend_id}
            )
        else:
            db.session.execute(
                """
                INSERT INTO active_chats (user_id, friend_id, is_active, last_action)
                VALUES (:user_id, :friend_id, 1, GETDATE())
                """, {'user_id': user_id, 'friend_id': friend_id}
            )
        db.session.commit()
        return jsonify({'message': 'Chat activated'})

    @staticmethod
    def deactivate_chat():
        data = request.json
        user_id = data['user_id']
        friend_id = data['friend_id']

        db.session.execute(
            """
            UPDATE active_chats SET is_active = 0, last_action = GETDATE()
            WHERE user_id = :user_id AND friend_id = :friend_id
            """, {'user_id': user_id, 'friend_id': friend_id}
        )
        db.session.commit()
        return jsonify({'message': 'Chat deactivated'})

    @staticmethod
    def delete_message(message_id):
        try:
            data = request.get_json()
            user_id = data.get('user_id')

            if not user_id:
                return jsonify({
                    'status': 'error',
                    'message': 'Kullanıcı ID gerekli'
                }), 400

            message = Message.check_message_exists(message_id, user_id)

            if not message:
                return jsonify({
                    'status': 'error',
                    'message': 'Mesaj bulunamadı veya silme yetkiniz yok'
                }), 404

            sender_id = message.sender_id
            receiver_id = message.receiver_id

            Message.delete_message(message_id)

            try:
                socketio.emit('message_deleted', {
                    'message_id': message_id,
                    'deleted_by': user_id
                }, room=str(user_id))
                socketio.emit('message_deleted', {
                    'message_id': message_id,
                    'deleted_by': user_id
                }, room=str(receiver_id if sender_id == user_id else sender_id))
            except Exception as e:
                print(f"Socket emit hatası: {e}")

            return jsonify({
                'status': 'success',
                'message': 'Mesaj başarıyla silindi'
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @staticmethod
    def delete_chat(user_id, friend_id):
        try:
            sql_delete = text("""
                DELETE FROM messages 
                WHERE (sender_id = :user_id AND receiver_id = :friend_id)
                OR (sender_id = :friend_id AND receiver_id = :user_id)
            """)
            result = db.session.execute(sql_delete, {
                "user_id": user_id,
                "friend_id": friend_id
            })
            db.session.commit()

            emit('chat_deleted', {
                'deleted_by': user_id,
                'friend_id': friend_id
            }, room=str(friend_id))

            return jsonify({
                'status': 'success',
                'message': 'Sohbet mesajları başarıyla silindi',
                'deleted_count': result.rowcount
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
