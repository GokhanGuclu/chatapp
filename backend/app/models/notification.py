from app import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    friendship_id = db.Column(db.Integer, db.ForeignKey('friendships.id'), nullable=True)

    user = db.relationship('User', backref=db.backref('notifications', lazy=True))
    friendship = db.relationship('Friendship', backref=db.backref('notifications', lazy=True))

    def __repr__(self):
        return f"<Notification {self.id} - {self.type}>"

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'content': self.content,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'friendship_id': self.friendship_id
        } 