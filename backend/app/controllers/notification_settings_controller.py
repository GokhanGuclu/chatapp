from app.models.notification_settings_model import NotificationSettings
from flask import request, jsonify

class NotificationSettingsController:
    @staticmethod
    def friend_notification():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON verisi bulunamadı'}), 400

            user_id = data.get('user_id')
            friend_notification = data.get('friend_notification')

            if not user_id:
                return jsonify({'error': 'Kullanıcı ID\'si gerekli'}), 400
            if friend_notification is None:
                return jsonify({'error': 'Bildirim ayarı gerekli'}), 400

            if not isinstance(friend_notification, bool):
                return jsonify({'error': 'Bildirim ayarı boolean olmalıdır'}), 400

            success, message = NotificationSettings.set_friend_notification(user_id, friend_notification)

            if not success:
                return jsonify({'error': message}), 500

            return jsonify({'message': message}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def message_notification():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON verisi bulunamadı'}), 400

            user_id = data.get('user_id')
            message_notification = data.get('message_notification')

            if not user_id:
                return jsonify({'error': 'Kullanıcı ID\'si gerekli'}), 400
            if message_notification is None:
                return jsonify({'error': 'Mesaj bildirimi ayarı gerekli'}), 400

            if not isinstance(message_notification, bool):
                return jsonify({'error': 'Mesaj bildirimi ayarı boolean olmalıdır'}), 400

            success, message = NotificationSettings.set_message_notification(user_id, message_notification)

            if not success:
                return jsonify({'error': message}), 500

            return jsonify({'message': message}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def system_notification():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON verisi bulunamadı'}), 400

            user_id = data.get('user_id')
            system_notification = data.get('system_notification')

            if not user_id:
                return jsonify({'error': 'Kullanıcı ID\'si gerekli'}), 400
            if system_notification is None:
                return jsonify({'error': 'Sistem bildirimi ayarı gerekli'}), 400

            if not isinstance(system_notification, bool):
                return jsonify({'error': 'Sistem bildirimi ayarı boolean olmalıdır'}), 400

            success, message = NotificationSettings.set_system_notification(user_id, system_notification)

            if not success:
                return jsonify({'error': message}), 500

            return jsonify({'message': message}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def notification_sound():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON verisi bulunamadı'}), 400

            user_id = data.get('user_id')
            notification_sound = data.get('notification_sound')

            if not user_id:
                return jsonify({'error': 'Kullanıcı ID\'si gerekli'}), 400
            if notification_sound is None:
                return jsonify({'error': 'Bildirim sesi ayarı gerekli'}), 400

            if not isinstance(notification_sound, bool):
                return jsonify({'error': 'Bildirim sesi ayarı boolean olmalıdır'}), 400

            success, message = NotificationSettings.set_notification_sound(user_id, notification_sound)

            if not success:
                return jsonify({'error': message}), 500

            return jsonify({'message': message}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def all_notification_settings():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON verisi bulunamadı'}), 400

            user_id = data.get('user_id')
            notification_settings = data.get('notification_settings')

            if not user_id:
                return jsonify({'error': 'Kullanıcı ID\'si gerekli'}), 400
            if not notification_settings:
                return jsonify({'error': 'Bildirim ayarları gerekli'}), 400

            required_fields = ['receive_message_notifications', 'receive_friend_notifications', 
                             'receive_system_notifications', 'notification_sound_enabled']
            
            for field in required_fields:
                if field not in notification_settings:
                    return jsonify({'error': f'{field} alanı gerekli'}), 400
                if not isinstance(notification_settings[field], bool):
                    return jsonify({'error': f'{field} boolean olmalıdır'}), 400

            success, message = NotificationSettings.set_all_notification_settings(user_id, notification_settings)

            if not success:
                return jsonify({'error': message}), 500

            return jsonify({'message': message}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_notification_settings():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON verisi bulunamadı'}), 400

            user_id = data.get('user_id')
            if not user_id:
                return jsonify({'error': 'Kullanıcı ID\'si gerekli'}), 400

            settings, message = NotificationSettings.get_notification_settings(user_id)
            
            if settings is None:
                return jsonify({'error': message}), 404

            return jsonify({
                'message': message,
                'settings': {
                    'receive_message_notifications': settings.receive_message_notifications,
                    'receive_friend_notifications': settings.receive_friend_notifications,
                    'receive_system_notifications': settings.receive_system_notifications,
                    'notification_sound_enabled': settings.notification_sound_enabled
                }
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

