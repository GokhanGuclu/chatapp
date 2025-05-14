from app import db
from datetime import datetime
from sqlalchemy import text

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = {'implicit_returning': False}

    def __repr__(self):
        return f"<Message {self.sender_id} -> {self.receiver_id}>"
    
    @staticmethod
    def get_messages(user_id, friend_id):
        """İki kullanıcı arasındaki mesajları getir"""
        sql_get_messages = text("""
            SELECT * FROM messages 
            WHERE (sender_id = :user_id AND receiver_id = :friend_id)
            OR (sender_id = :friend_id AND receiver_id = :user_id)
            ORDER BY sent_at ASC
        """)
        try:
            messages = db.session.execute(sql_get_messages, {
                "user_id": user_id,
                "friend_id": friend_id
            }).fetchall()
            return messages
        except Exception as e:
            print(f"Mesajlar getirilirken hata: {str(e)}")
            return []
    
    @staticmethod
    def send_message(sender_id, receiver_id, content):
        """Yeni bir mesaj gönder"""
        try:
            new_message = text(""" 
            INSERT INTO messages (sender_id, receiver_id, content, sent_at)
            VALUES (:sender_id, :receiver_id, :content, :sent_at)
            RETURNING id
            """)
            db.session.execute(new_message, {
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "content": content,
                "sent_at": datetime.utcnow()
            })
            db.session.commit()
            return new_message
        except Exception as e:
            db.session.rollback()
            print(f"Mesaj gönderilirken hata: {str(e)}")
            return None

    @staticmethod
    def check_message_exists(message_id, user_id):
        """Mesajın varlığını ve kullanıcının yetkisini kontrol et"""
        sql_check = text("""
            SELECT * FROM messages 
            WHERE id = :message_id 
            AND (sender_id = :user_id OR receiver_id = :user_id)
        """)
        try:
            message = db.session.execute(sql_check, {
                "message_id": message_id,
                "user_id": user_id
            }).fetchone()
            return message
        except Exception as e:
            print(f"Mesaj kontrolü yapılırken hata: {str(e)}")
            return None

    @staticmethod
    def delete_message(message_id):
        """Mesajı sil"""
        sql_delete = text("""
            DELETE FROM messages WHERE id = :message_id
        """)
        try:
            db.session.execute(sql_delete, {"message_id": message_id})
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Mesaj silinirken hata: {str(e)}")
            return False