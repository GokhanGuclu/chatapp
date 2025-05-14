from flask import Blueprint
from app.controllers.friendship_controller import FriendshipController

friendship_bp = Blueprint('friendship', __name__, url_prefix='/friendship')

@friendship_bp.route('/add', methods=['POST'])
def add_friend():
    return FriendshipController.add_friend()


@friendship_bp.route('/accept', methods=['POST'])
def accept_friend():
    return FriendshipController.accept_friend()


@friendship_bp.route('/reject', methods=['POST'])
def reject_friend():
    return FriendshipController.reject_friend()


@friendship_bp.route('/remove', methods=['POST'])
def remove_friend():
    return FriendshipController.remove_friend()


@friendship_bp.route('/list/<int:user_id>', methods=['GET'])
def list_friends(user_id):
    return FriendshipController.list_friends(user_id)


@friendship_bp.route('/pending/<int:user_id>', methods=['GET'])
def pending_requests(user_id):
    return FriendshipController.pending_requests(user_id)


@friendship_bp.route('/sent/<int:user_id>', methods=['GET'])
def sent_requests(user_id):
    return FriendshipController.sent_requests(user_id)


@friendship_bp.route('/cancel', methods=['POST'])
def cancel_friend_request():
    return FriendshipController.cancel_friend_request()

