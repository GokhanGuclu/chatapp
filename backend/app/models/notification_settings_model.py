from app import db

class NotificationSettings(db.Model):
    __tablename__ = 'notification_settings'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    receive_message_notifications = db.Column(db.Boolean, default=True)
    receive_friend_notifications = db.Column(db.Boolean, default=True)
    receive_system_notifications = db.Column(db.Boolean, default=True)
    notification_sound_enabled = db.Column(db.Boolean, default=True)

    user = db.relationship('User', backref=db.backref('notification_settings', uselist=False))

    def __repr__(self):
        return f"<NotificationSettings user_id={self.user_id}>"