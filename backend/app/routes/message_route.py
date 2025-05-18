from flask import Blueprint
from app.controllers.message_controller import MessageController

message_bp = Blueprint('message', __name__, url_prefix='/message')

@message_bp.route('/history/<int:user_id>/<int:friend_id>', methods=['GET'])
def get_message_history(user_id, friend_id):
    return MessageController.get_message_history(user_id, friend_id)

@message_bp.route('/active_chats/<int:user_id>', methods=['GET'])
def get_active_chats(user_id):
    return MessageController.get_active_chats(user_id)

@message_bp.route('/active_chats/activate', methods=['POST'])
def activate_chat():
    return MessageController.activate_chat()

@message_bp.route('/active_chats/deactivate', methods=['POST'])
def deactivate_chat():
    return MessageController.deactivate_chat()

@message_bp.route('/send_message', methods=['POST'])
def send_message():
    return MessageController.send_message()

@message_bp.route('/delete/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    return MessageController.delete_message(message_id)

@message_bp.route('/delete-chat/<int:user_id>/<int:friend_id>', methods=['DELETE'])
def delete_chat(user_id, friend_id):
    return MessageController.delete_chat(user_id, friend_id)


