from flask import Blueprint
from app.controllers.notification_settings_controller import NotificationSettingsController

notification_settings_bp = Blueprint('notification_settings', __name__, url_prefix='/notification_settings')

@notification_settings_bp.route('/friend_notification', methods=['POST'])
def friend_notification():
    return NotificationSettingsController.friend_notification()

@notification_settings_bp.route('/message_notification', methods=['POST'])
def message_notification():
    return NotificationSettingsController.message_notification()

@notification_settings_bp.route('/system_notification', methods=['POST'])
def system_notification():
    return NotificationSettingsController.system_notification()

@notification_settings_bp.route('/notification_sound', methods=['POST'])
def notification_sound():
    return NotificationSettingsController.notification_sound()

@notification_settings_bp.route('/all_notification_settings', methods=['POST'])
def all_notification_settings():
    return NotificationSettingsController.all_notification_settings()

@notification_settings_bp.route('/get_notification_settings', methods=['POST'])
def get_notification_settings():
    return NotificationSettingsController.get_notification_settings()

