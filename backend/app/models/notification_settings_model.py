from app import db
from sqlalchemy import text
from datetime import datetime
import pytz

class NotificationSettings(db.Model):
    __tablename__ = 'notification_settings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    receive_message_notifications = db.Column(db.Boolean, default=True, nullable=False)
    receive_friend_notifications = db.Column(db.Boolean, default=True, nullable=False)
    receive_system_notifications = db.Column(db.Boolean, default=True, nullable=False)
    notification_sound_enabled = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(pytz.timezone('Europe/Istanbul')).astimezone(pytz.UTC))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(pytz.timezone('Europe/Istanbul')).astimezone(pytz.UTC), onupdate=lambda: datetime.now(pytz.timezone('Europe/Istanbul')).astimezone(pytz.UTC))

    def __repr__(self):
        return f"<NotificationSettings {self.user_id}>"

    @staticmethod
    def set_friend_notification(user_id, friend_notification):
        try:
            sql = text("""
                UPDATE notification_settings
                SET receive_friend_notifications=:friend_notification
                WHERE user_id=:user_id
            """)
            db.session.execute(sql, {"user_id": user_id, "friend_notification": friend_notification})
            db.session.commit()
            return True, "Bildirim ayarı başarıyla güncellendi"
        except Exception as e:
            db.session.rollback()
            return False, str(e)
        
    @staticmethod
    def set_message_notification(user_id, message_notification):
        try:
            sql = text("""
                UPDATE notification_settings
                SET receive_message_notifications=:message_notification
                WHERE user_id=:user_id
            """)
            db.session.execute(sql, {"user_id": user_id, "message_notification": message_notification})
            db.session.commit()
            return True, "Mesaj bildirimleri başarıyla güncellendi"
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    @staticmethod
    def set_system_notification(user_id, system_notification):
        try:
            sql = text("""
                UPDATE notification_settings
                SET receive_system_notifications=:system_notification
                WHERE user_id=:user_id
            """)
            db.session.execute(sql, {"user_id": user_id, "system_notification": system_notification})
            db.session.commit()
            return True, "Sistem bildirimleri başarıyla güncellendi"
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    @staticmethod
    def set_notification_sound(user_id, notification_sound):
        try:
            sql = text("""
                UPDATE notification_settings
                SET notification_sound_enabled=:notification_sound
                WHERE user_id=:user_id
            """)
            db.session.execute(sql, {"user_id": user_id, "notification_sound": notification_sound})
            db.session.commit()
            return True, "Bildirim sesi başarıyla güncellendi"
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    @staticmethod
    def set_all_notification_settings(user_id, notification_settings):
        try:
            sql = text("""
                UPDATE notification_settings
                SET receive_message_notifications=:receive_message_notifications,
                    receive_friend_notifications=:receive_friend_notifications,
                    receive_system_notifications=:receive_system_notifications,
                    notification_sound_enabled=:notification_sound_enabled
                WHERE user_id=:user_id
            """)
            db.session.execute(sql, {
                "user_id": user_id,
                "receive_message_notifications": notification_settings.get('receive_message_notifications'),
                "receive_friend_notifications": notification_settings.get('receive_friend_notifications'),
                "receive_system_notifications": notification_settings.get('receive_system_notifications'),
                "notification_sound_enabled": notification_settings.get('notification_sound_enabled')
            })
            db.session.commit()
            return True, "Tüm bildirim ayarları başarıyla güncellendi"
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    @staticmethod
    def get_notification_settings(user_id):
        try:
            sql_check = text("""
                SELECT * FROM notification_settings WHERE user_id = :user_id
            """)
            result = db.session.execute(sql_check, {"user_id": user_id}).fetchone()

            if not result:
                sql_insert = text("""
                    INSERT INTO notification_settings 
                    (user_id, receive_message_notifications, receive_friend_notifications, 
                     receive_system_notifications, notification_sound_enabled) 
                    VALUES 
                    (:user_id, :receive_message_notifications, :receive_friend_notifications, 
                     :receive_system_notifications, :notification_sound_enabled)
                """)
                db.session.execute(sql_insert, {
                    "user_id": user_id,
                    "receive_message_notifications": True,
                    "receive_friend_notifications": True,
                    "receive_system_notifications": True,
                    "notification_sound_enabled": True
                })
                db.session.commit()

                # Yeni eklenen kaydı getir
                result = db.session.execute(sql_check, {"user_id": user_id}).fetchone()

            if not result:
                return None, "Bildirim ayarları bulunamadı"

            return result, "Bildirim ayarları başarıyla getirildi"
        except Exception as e:
            db.session.rollback()
            return None, str(e)
