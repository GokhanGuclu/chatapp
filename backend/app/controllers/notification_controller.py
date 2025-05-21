from app.models.notification_model import Notification
from flask import jsonify

class NotificationController:
    @staticmethod
    def get_notifications(user_id):
        """Kullanıcının bildirimlerini getir"""
        try:
            notifications = Notification.get_notifications(user_id)
            return jsonify({
                'status': 'success',
                'notifications': notifications
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': 'Bildirimler alınırken bir hata oluştu'
            }), 500

    @staticmethod
    def mark_as_read(notification_id, user_id):
        """Bildirimi okundu olarak işaretle"""
        try:
            success = Notification.mark_as_read(notification_id, user_id)
            if success:
                return jsonify({
                    'status': 'success',
                    'message': 'Bildirim okundu olarak işaretlendi'
                }), 200
            return jsonify({
                'status': 'error',
                'message': 'Bildirim bulunamadı veya işaretlenemedi'
            }), 404
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': 'Bildirim işaretlenirken bir hata oluştu'
            }), 500

    @staticmethod
    def get_unread_count(user_id):
        """Okunmamış bildirim sayısını getir"""
        try:
            count = Notification.get_unread_count(user_id)
            return jsonify({
                'status': 'success',
                'count': count
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': 'Bildirim sayısı alınırken bir hata oluştu'
            }), 500
    
        