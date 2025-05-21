from flask import Blueprint
from app.controllers.notification_controller import NotificationController

notification_bp = Blueprint('notification', __name__, url_prefix='/notification')

@notification_bp.route('/get_notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    """Kullanıcının bildirimlerini getir"""
    return NotificationController.get_notifications(user_id)

@notification_bp.route('/mark_read/<int:notification_id>/<int:user_id>', methods=['POST'])
def mark_as_read(notification_id, user_id):
    """Bildirimi okundu olarak işaretle"""
    return NotificationController.mark_as_read(notification_id, user_id)

@notification_bp.route('/unread_count/<int:user_id>', methods=['GET'])
def get_unread_count(user_id):
    """Okunmamış bildirim sayısını getir"""
    return NotificationController.get_unread_count(user_id)


