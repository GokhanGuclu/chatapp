from flask import request, jsonify, current_app
from app import db
from werkzeug.security import check_password_hash
import os
from werkzeug.utils import secure_filename
import uuid
from app.models.user_model import User

class UserController:
    @staticmethod
    def register():
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({'error': 'Eksik bilgi'}), 400

        success, message = User.create_user(username, email, password)

        if not success:
            return jsonify({'error': message}), 409 if 'zaten kullanımda' in message else 500

        return jsonify({'message': message}), 201

    @staticmethod
    def login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Eksik bilgi'}), 400

        user = User.login_user(email, password)

        if not user:
            return jsonify({'error': 'Geçersiz email veya şifre.'}), 401


        return jsonify({'message': 'Giriş başarılı.', 'username': user.username, 'user_id': user.id}), 200

    @staticmethod
    def get_user_by_username(username):
        user = User.get_username(username)

        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı.'}), 404

        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 200

    @staticmethod
    def get_profile_by_id(user_id):
        user = User.get_profile(user_id)

        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı.'}), 404

        return jsonify({
            'username': user.username,
            'email': user.email,
            'display_name': user.display_name,
            'status': user.status,
            'profile_picture': user.profile_picture,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }), 200

    @staticmethod
    def update_profile_picture(user_id):
        if 'profile_picture' not in request.files:
            return jsonify({'error': 'Profil fotoğrafı bulunamadı'}), 400

        file = request.files['profile_picture']
        if file.filename == '':
            return jsonify({'error': 'Dosya seçilmedi'}), 400

        if file:
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
            if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
                return jsonify({'error': 'Geçersiz dosya formatı'}), 400

            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            file_path = os.path.join(current_app.root_path, '..', 'pp', filename)

            sql_get_old = User.get_profile_picture(user_id)
            result = db.session.execute(sql_get_old, {"user_id": user_id}).scalar()
            old_picture = result if result else 'default_avatar.png'

            if old_picture and old_picture != 'default_avatar.png':
                old_path = os.path.join(current_app.root_path, '..', 'pp', old_picture)
                if os.path.exists(old_path):
                    os.remove(old_path)

            file.save(file_path)

            User.update_profile_picture(user_id, filename)

            return jsonify({
                'message': 'Profil fotoğrafı başarıyla güncellendi',
                'profile_picture': filename
            }), 200

    @staticmethod
    def update_status(user_id):
        data = request.get_json()
        new_status = data.get('status')

        if not new_status:
            return jsonify({'error': 'Durum mesajı boş olamaz'}), 400

        if len(new_status) > 100:
            return jsonify({'error': 'Durum mesajı çok uzun'}), 400

        User.update_status(user_id, new_status)
        db.session.commit()

        return jsonify({
            'message': 'Durum mesajı başarıyla güncellendi',
            'status': new_status
        }), 200

    @staticmethod
    def change_password(user_id):
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({'error': 'Mevcut şifre ve yeni şifre gereklidir'}), 400

        user = User.get_password(user_id)

        if not user or not check_password_hash(user.password, current_password):
            return jsonify({'error': 'Mevcut şifre yanlış'}), 401

        User.change_password(user_id, new_password)

        return jsonify({'message': 'Şifre başarıyla değiştirildi'}), 200

    @staticmethod
    def update_display_name(user_id):
        data = request.get_json()
        new_display_name = data.get('display_name')

        if not new_display_name:
            return jsonify({'error': 'Görünen ad boş olamaz'}), 400

        if len(new_display_name) > 50:
            return jsonify({'error': 'Görünen ad çok uzun'}), 400

        User.update_display_name(user_id, new_display_name)

        return jsonify({
            'message': 'Görünen ad başarıyla güncellendi',
            'display_name': new_display_name
        }), 200

    @staticmethod
    def update_last_seen(user_id):
        try:
            success = User.update_last_seen(user_id)
            if not success:
                return jsonify({'error': 'Son görülme zamanı güncellenirken bir hata oluştu'}), 500
            return jsonify({'message': 'Son görülme zamanı güncellendi'}), 200
        except Exception as e:
            return jsonify({'error': f'Bir hata oluştu: {str(e)}'}), 500

    @staticmethod
    def toggle_last_seen(user_id):
        data = request.get_json()
        show_last_seen = data.get('show_last_seen')

        if show_last_seen is None:
            return jsonify({'error': 'show_last_seen parametresi gereklidir'}), 400

        User.toggle_last_seen(user_id, show_last_seen)

        return jsonify({
            'message': 'Son görülme ayarı güncellendi',
            'show_last_seen': show_last_seen
        }), 200

    @staticmethod
    def get_user_status(user_id):
        user = User.get_user_status(user_id)

        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404

        return jsonify({
            'id': user.id,
            'username': user.username,
            'display_name': user.display_name,
            'profile_picture': user.profile_picture,
            'status': user.status,
            'is_online': user.is_online,
            'last_seen': user.last_seen.isoformat() if user.last_seen else None
        }), 200

    @staticmethod
    def get_friends_status(user_id):
        friends = User.get_friends_status(user_id)

        friend_statuses = []
        for friend in friends:
            friend_statuses.append({
                'id': friend.id,
                'username': friend.username,
                'display_name': friend.display_name,
                'profile_picture': friend.profile_picture,
                'status': friend.status,
                'is_online': friend.is_online,
                'last_seen': friend.last_seen.isoformat() if friend.last_seen else None
            })

        return jsonify({'friends': friend_statuses}), 200
