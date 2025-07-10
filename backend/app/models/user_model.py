from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
import pytz

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(pytz.timezone('Europe/Istanbul')).astimezone(pytz.UTC))
    display_name = db.Column(db.String(50))
    status = db.Column(db.String(100), default='Merhaba! Ben buradayım.')
    profile_picture = db.Column(db.String(255), default='default_avatar.png')
    last_seen = db.Column(db.DateTime, nullable=True)
    is_online = db.Column(db.Boolean, default=False, nullable=False)
    show_last_seen = db.Column(db.Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<User {self.username}>"
    
    @staticmethod
    def create_user(username, email, password):
        if User.check_user(username, email):
            return False, "Bu kullanıcı adı veya email zaten kullanımda"

        try:
            hashed_password = generate_password_hash(password)

            sql_insert = text("""
                INSERT INTO users (username, email, password, created_at, display_name, status, profile_picture)
                VALUES (:username, :email, :password, NOW(), :username, :status, :profile_picture)
            """)

            db.session.execute(sql_insert, {
                "username": username,
                "email": email,
                "password": hashed_password,
                "status": "Merhaba! Ben buradayım.",
                "profile_picture": "default_avatar.png"
            })
            db.session.commit()
            return True, "Kullanıcı başarıyla oluşturuldu"

        except Exception as e:
            db.session.rollback()
            return False, f"Kullanıcı oluşturulurken bir hata oluştu: {str(e)}"
    
    @staticmethod
    def check_user(username, email):
        sql_query = text("""
            SELECT * FROM users WHERE username = :username OR email = :email
        """)

        user = db.session.execute(sql_query, {"username": username, "email": email}).fetchone() 

        return user
        
    @staticmethod
    def login_user(email, password):
        sql_query = text("""
            SELECT * FROM users WHERE email = :email
        """)
        
        user = db.session.execute(sql_query, {"email": email}).fetchone()
        
        if not user or not check_password_hash(user.password, password):
            return None
            
        return User.query.get(user.id)
    
    @staticmethod
    def get_username(username):
        sql_get_user = text("""
            SELECT * FROM users WHERE username = :username
        """)
        user = db.session.execute(sql_get_user, {"username": username}).fetchone()

        return user

    @staticmethod
    def get_profile(user_id):
        sql_get_user = text("""
            SELECT * FROM users WHERE id = :user_id
        """)
        user = db.session.execute(sql_get_user, {"user_id": user_id}).fetchone()

        return user
    
    @staticmethod
    def get_profile_picture(user_id):
        sql_get_profile_picture = text("""
            SELECT profile_picture FROM users WHERE id = :user_id
        """)
        profile_picture = db.session.execute(sql_get_profile_picture, {"user_id": user_id}).fetchone()
        return profile_picture
            
    @staticmethod
    def update_profile_picture(user_id, profile_picture):
        sql_update_profile_picture = text("""
            UPDATE users SET profile_picture = :profile_picture WHERE id = :user_id
        """)
        db.session.execute(sql_update_profile_picture, {"profile_picture": profile_picture, "user_id": user_id})
        db.session.commit()

    @staticmethod
    def update_status(user_id, status):
        sql_update_status = text("""
            UPDATE users SET status = :status WHERE id = :user_id
        """)
        db.session.execute(sql_update_status, {"status": status, "user_id": user_id})
        db.session.commit()

    @staticmethod
    def change_password(user_id, password):
        hashed_password = generate_password_hash(password)
        sql_change_password = text("""
            UPDATE users SET password = :password WHERE id = :user_id
        """)
        db.session.execute(sql_change_password, {"password": hashed_password, "user_id": user_id})
        db.session.commit()

    @staticmethod
    def get_password(user_id):
        sql_get_password = text("""
            SELECT password FROM users WHERE id = :user_id
        """)
        password = db.session.execute(sql_get_password, {"user_id": user_id}).fetchone()
        return password

    @staticmethod
    def update_display_name(user_id, display_name):
        sql_update_display_name = text("""
            UPDATE users SET display_name = :display_name WHERE id = :user_id
        """)
        db.session.execute(sql_update_display_name, {"display_name": display_name, "user_id": user_id})
        db.session.commit()

    @staticmethod
    def update_last_seen(user_id):
        istanbul_tz = pytz.timezone('Europe/Istanbul')
        current_time = datetime.now(istanbul_tz).astimezone(pytz.UTC)
        
        sql_update_last_seen = text("""
            UPDATE users 
            SET last_seen = :last_seen, is_online = 1
            WHERE id = :user_id
        """)
        try:
            db.session.execute(sql_update_last_seen, {
                "last_seen": current_time,
                "user_id": user_id
            })
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Son görülme güncellenirken hata: {str(e)}")
            return False

    @staticmethod
    def toggle_last_seen(user_id, show_last_seen):
        sql_toggle_last_seen = text("""
            UPDATE users SET show_last_seen = :show_last_seen, is_online = 0 WHERE id = :user_id
        """)
        db.session.execute(sql_toggle_last_seen, {"show_last_seen": show_last_seen, "user_id": user_id})
        db.session.commit()

    @staticmethod
    def get_user_status(user_id):
        sql_get_user_status = text("""
            SELECT * FROM user_status_view WHERE id = :user_id
        """)
        user_status = db.session.execute(sql_get_user_status, {"user_id": user_id}).fetchone()
        return user_status
    
    @staticmethod
    def get_friends_status(user_id):
        sql_get_friends = text("""
        SELECT usv.*
        FROM user_status_view usv
            INNER JOIN friendships f ON (f.user_id = usv.id OR f.friend_id = usv.id)
            WHERE (f.user_id = :user_id OR f.friend_id = :user_id)
            AND f.status = 'accepted'
            AND usv.id != :user_id
        """)
        friends = db.session.execute(sql_get_friends, {"user_id": user_id}).fetchall()
        return friends
