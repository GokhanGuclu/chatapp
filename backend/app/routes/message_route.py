from flask import Blueprint
from app.controllers.message_controller import MessageController

message_bp = Blueprint('message', __name__, url_prefix='/message')

@message_bp.route('/history/<int:user_id>/<int:friend_id>', methods=['GET'])
def get_message_history(user_id, friend_id):
    return MessageController.get_message_history(user_id, friend_id)


@message_bp.route('/delete/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    return MessageController.delete_message(message_id)

@message_bp.route('/delete-chat/<int:user_id>/<int:friend_id>', methods=['DELETE'])
def delete_chat(user_id, friend_id):
    return MessageController.delete_message(user_id, friend_id)

@message_bp.route('/open_chat/<int:user_id>/<int:friend_id>', methods=['GET'])
def open_chat(user_id, friend_id):
    return MessageController.open_chat(user_id, friend_id)

@message_bp.route('/close_chat/<int:user_id>/<int:friend_id>', methods=['GET'])
def close_chat(user_id, friend_id):
    return MessageController.close_chat(user_id, friend_id)

@message_bp.route('/get_active_chats/<int:user_id>', methods=['GET'])
def get_active_chats(user_id):
    return MessageController.get_active_chats(user_id)