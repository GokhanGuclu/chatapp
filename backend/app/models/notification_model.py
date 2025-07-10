from app import db
from datetime import datetime
from sqlalchemy import text

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    notification_type = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    related_id = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f"<Notification {self.id} - {self.notification_type} to {self.user_id}>"
    
    @staticmethod
    def get_notifications(user_id):
        """Kullanıcının bildirimlerini getir"""
        sql_check = text("""
            SELECT receive_friend_notifications, receive_message_notifications 
            FROM notification_settings 
            WHERE user_id = :user_id
        """)

        settings = db.session.execute(sql_check, {"user_id": user_id}).fetchone()
        
        # Varsayılan olarak tüm bildirimleri göster
        friend_notifications_enabled = True
        message_notifications_enabled = True
        
        if settings:
            friend_notifications_enabled = settings.receive_friend_notifications
            message_notifications_enabled = settings.receive_message_notifications

        sql = text("""
            SELECT 
                n.id,
                n.user_id,
                n.sender_id,
                n.notification_type,
                n.content,
                n.is_read,
                n.created_at,
                n.related_id,
                u.username as sender_username,
                u.profile_picture as sender_profile_picture
            FROM notifications n
            LEFT JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = :user_id
            AND (
                (:friend_notifications_enabled = 1 AND n.notification_type IN ('friend_request', 'friend_accept'))
                OR (:message_notifications_enabled = 1 AND n.notification_type = 'message')
                OR n.notification_type NOT IN ('friend_request', 'friend_accept', 'message')
            )
            ORDER BY n.created_at DESC
        """)
        try:
            notifications = db.session.execute(sql, {
                "user_id": user_id,
                "friend_notifications_enabled": friend_notifications_enabled,
                "message_notifications_enabled": message_notifications_enabled
            }).fetchall()
            return [dict(row._mapping) for row in notifications]
        except Exception as e:
            print(f"Bildirimler getirilirken hata: {str(e)}")
            return []

    @staticmethod
    def mark_as_read(notification_id, user_id):
        """Bildirimi okundu olarak işaretle"""
        sql = text("""
            UPDATE notifications 
            SET is_read = 1 
            WHERE id = :notification_id AND user_id = :user_id
        """)
        try:
            db.session.execute(sql, {
                "notification_id": notification_id,
                "user_id": user_id
            })
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Bildirim okundu olarak işaretlenirken hata: {str(e)}")
            return False

    @staticmethod
    def get_unread_count(user_id):
        """Okunmamış bildirim sayısını getir"""
        sql = text("""
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = :user_id AND is_read = 0
        """)
        try:
            result = db.session.execute(sql, {"user_id": user_id}).fetchone()
            return result.count if result else 0
        except Exception as e:
            print(f"Okunmamış bildirim sayısı alınırken hata: {str(e)}")
            return 0
    