from app import db
from datetime import datetime
from sqlalchemy import text

class Friendship(db.Model):
    __tablename__ = 'friendships'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Friendship {self.user_id} -> {self.friend_id}>"

    @staticmethod
    def check_pending_request(user_id, friend_id):
        check_sql = text("""
        SELECT * FROM friendships
        WHERE (user_id = :user_id AND friend_id = :friend_id)
        OR (user_id = :friend_id AND friend_id = :user_id)
        AND status = 'pending'
        """)

        result = db.session.execute(check_sql, {"user_id": user_id, "friend_id": friend_id}).fetchone()

        if result:
            return True
        else:
            return False

    @staticmethod
    def get_friendship_requests(user_id, friend_id):
        sql_add_friend = text("""
        INSERT INTO friendships (user_id, friend_id, status, created_at)
        VALUES (:user_id, :friend_id, 'pending', GETDATE())
        """)

        db.session.execute(sql_add_friend, {"user_id": user_id, "friend_id": friend_id})
        db.session.commit()

    @staticmethod
    def get_friendship_id(user_id, friend_id):
        sql_get_id = text("""
            SELECT TOP 1 id 
            FROM friendships 
            WHERE user_id = :user_id 
            AND friend_id = :friend_id 
            AND status = 'pending' 
            ORDER BY created_at DESC
        """)

        result = db.session.execute(sql_get_id, {"user_id": user_id, "friend_id": friend_id}).fetchone()

        return result[0]
    
    @staticmethod
    def get_sender_info(id):
        sql_sender_info = text("""
            SELECT username FROM users WHERE id = :id
        """)

        result = db.session.execute(sql_sender_info, {"id": id}).fetchone()

        return result[0]
    
    @staticmethod
    def check_friendship(friendship_id):
        sql_check = text("SELECT * FROM friendships WHERE id = :id AND status = 'pending'")

        result = db.session.execute(sql_check, {"id": friendship_id}).fetchone()    
        return result
        
    @staticmethod
    def accept_friendship(friendship_id):
        sql_accept = text("UPDATE friendships SET status = 'accepted' WHERE id = :id")
        db.session.execute(sql_accept, {"id": friendship_id})
        db.session.commit()

    @staticmethod
    def reject_friendship(friendship_id):
        sql_delete = text("DELETE FROM friendships WHERE id = :id")
        db.session.execute(sql_delete, {"id": friendship_id})
        db.session.commit()

    @staticmethod
    def check_friendship_status(user_id, friend_id):
        sql_check = text("""
            SELECT * FROM friendships 
            WHERE ((user_id = :user_id AND friend_id = :friend_id) 
            OR (user_id = :friend_id AND friend_id = :user_id))
        """)
        
        result = db.session.execute(sql_check, {"user_id": user_id, "friend_id": friend_id}).fetchone()

        return result

    @staticmethod
    def remove_friendship(user_id, friend_id):
        sql_delete = text("""
            DELETE FROM friendships 
            WHERE ((user_id = :user_id AND friend_id = :friend_id) 
            OR (user_id = :friend_id AND friend_id = :user_id))
        """)

        db.session.execute(sql_delete, {"user_id": user_id, "friend_id": friend_id})
        db.session.commit()

    @staticmethod
    def get_friendship_list(user_id):
        sql_get_friendship_list = text("""
            SELECT * FROM friendships WHERE (user_id = :user_id OR friend_id = :user_id) AND status = 'accepted'
        """)

        result = db.session.execute(sql_get_friendship_list, {"user_id": user_id}).fetchall()

        return result
    
    @staticmethod
    def get_pending_requests(user_id):
        sql_pending = text("""
            SELECT * FROM friendships 
            WHERE friend_id = :user_id AND status = 'pending'
        """)

        result = db.session.execute(sql_pending, {"user_id": user_id}).fetchall()

        return result

    @staticmethod
    def sent_requests(user_id):
        sql_sent = text("""
            SELECT * FROM friendships 
            WHERE user_id = :user_id AND status = 'pending'
        """)

        result = db.session.execute(sql_sent, {"user_id": user_id}).fetchall()

        return result
    
    @staticmethod
    def check_cancel_request(user_id, friend_id):
        sql_cancel = text("""
            SELECT * FROM friendships 
            WHERE user_id = :user_id AND friend_id = :friend_id AND status = 'pending'
        """)

        result = db.session.execute(sql_cancel, {"user_id": user_id, "friend_id": friend_id}).fetchone()

        return result
    
    @staticmethod
    def cancel_request(user_id, friend_id):
        sql_cancel = text("""
            DELETE FROM friendships 
            WHERE user_id = :user_id AND friend_id = :friend_id AND status = 'pending'
        """)

        db.session.execute(sql_cancel, {"user_id": user_id, "friend_id": friend_id})
        db.session.commit()
