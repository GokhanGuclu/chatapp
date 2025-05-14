from flask import Blueprint
from app.controllers.user_controller import UserController

user_bp = Blueprint('user', __name__, url_prefix='/user')

@user_bp.route('/register', methods=['POST'])
def register():
    return UserController.register()

@user_bp.route('/login', methods=['POST'])
def login():
    return UserController.login()

@user_bp.route('/get_by_username/<string:username>', methods=['GET'])
def get_by_username(username):
    return UserController.get_by_username(username)

@user_bp.route('/get_profile/<int:user_id>', methods=['GET'])
def get_profile_by_id(user_id):
    return UserController.get_profile_by_id(user_id)

@user_bp.route('/update_profile_picture/<int:user_id>', methods=['POST'])
def update_profile_picture(user_id):
    return UserController.update_profile_picture(user_id)

@user_bp.route('/update_status/<int:user_id>', methods=['PUT'])
def update_status(user_id):
    return UserController.update_status(user_id)

@user_bp.route('/change_password/<int:user_id>', methods=['PUT'])
def change_password(user_id):
    return UserController.change_password(user_id)

@user_bp.route('/update_display_name/<int:user_id>', methods=['PUT'])
def update_display_name(user_id):
    return UserController.update_display_name(user_id)

@user_bp.route('/update_last_seen/<int:user_id>', methods=['PUT'])
def update_last_seen(user_id):
    return UserController.update_last_seen(user_id)

@user_bp.route('/toggle_last_seen/<int:user_id>', methods=['PUT'])
def toggle_last_seen(user_id):
    return UserController.toggle_last_seen(user_id)

@user_bp.route('/get_user_status/<int:user_id>', methods=['GET'])
def get_user_status(user_id):
    return UserController.get_user_status(user_id)
    
@user_bp.route('/get_friends_status/<int:user_id>', methods=['GET'])
def get_friends_status(user_id):
    return UserController.get_friends_status(user_id)