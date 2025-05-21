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
        
    @staticmethod
    def open_chat(user_id, friend_id):

        sql_check = text("""
            SELECT * FROM active_chats
            WHERE user_id = :user_id AND friend_id = :friend_id
        """)

        try:
            result = db.session.execute(sql_check, {"user_id": user_id, "friend_id": friend_id}).fetchone()

        except Exception as e:
            print(f"Sohbet açılırken hata: {str(e)}")
            return False
        
        if not result:
            sql_insert = text("""
                INSERT INTO active_chats (user_id, friend_id, isopen) 
                VALUES (:user_id, :friend_id, 1)
            """)
            try:
                db.session.execute(sql_insert, {"user_id": user_id, "friend_id": friend_id})
                db.session.commit()
                return True
            except Exception as e:
                db.session.rollback()
                print(f"Sohbet açılırken hata: {str(e)}")
                return False
        
        else:
            sql_open = text("""
                UPDATE active_chats
                SET isopen = 1
                WHERE user_id = :user_id AND friend_id = :friend_id
            """)

            try:
                db.session.execute(sql_open, {"user_id": user_id, "friend_id": friend_id})
                db.session.commit()
                return True
            except Exception as e:
                db.session.rollback()
                print(f"Sohbet açılırken hata: {str(e)}")
                return False
    @staticmethod
    def close_chat(user_id, friend_id):

        sql_check = text("""
            SELECT * FROM active_chats
            WHERE user_id = :user_id AND friend_id = :friend_id
        """)

        try:
            result = db.session.execute(sql_check, {"user_id": user_id, "friend_id": friend_id}).fetchone()

        except Exception as e:
            print(f"Sohbet açılırken hata: {str(e)}")
            return False
        
        if not result:
            sql_insert = text("""
                INSERT INTO active_chats (user_id, friend_id, isopen)
                VALUES (:user_id, :friend_id, 0)
            """)
            db.session.execute(sql_insert, {"user_id": user_id, "friend_id": friend_id})
            db.session.commit()
        
        else:

            sql_close = text("""
                UPDATE active_chats
                SET isopen = 0
                WHERE user_id = :user_id AND friend_id = :friend_id
            """)

            try:
                db.session.execute(sql_close, {"user_id": user_id, "friend_id": friend_id})
                db.session.commit()
                return True
            except Exception as e:
                db.session.rollback()
                print(f"Sohbet kapatılırken hata: {str(e)}")
                return False
        
    def get_active_chats(user_id):
        sql_active = text("""
            SELECT
                rc.user_id,
                rc.friend_id,
                rc.last_message_content,
                u.username AS friend_username,
                u.profile_picture AS friend_profile_picture,
                rc.isopen,
                rc.last_message_time
            FROM recent_chats_view rc
            JOIN users u ON u.id = rc.friend_id
            WHERE rc.user_id = :user_id AND rc.isopen = 1
        """)
        try:
            chats = db.session.execute(sql_active, {"user_id": user_id}).fetchall()
            chat_list = [dict(row._mapping) for row in chats]
            return chat_list
        except Exception as e:
            print(f"Aktif sohbetler getirilirken hata: {str(e)}")
            return []