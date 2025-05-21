from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
import logging
from flask_cors import CORS
import os

db = SQLAlchemy()
socketio = SocketIO(
    cors_allowed_origins=["http://localhost:3000"],
    ping_timeout=60,
    ping_interval=25,
    max_http_buffer_size=1e8
)

logging.basicConfig()
logger = logging.getLogger('sqlalchemy.engine')
logger.setLevel(logging.INFO)

def create_app():
    app = Flask(__name__, static_folder='../pp', static_url_path='/pp')
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "supports_credentials": True}})
    app.config.from_object('config.Config')

    # pp klasörünün varlığını kontrol et ve yoksa oluştur
    pp_folder = os.path.join(app.root_path, '..', 'pp')
    if not os.path.exists(pp_folder):
        os.makedirs(pp_folder)

    db.init_app(app)
    socketio.init_app(app, cors_allowed_origins=["http://localhost:3000"])

    from app.routes.user_route import user_bp
    app.register_blueprint(user_bp)

    from app.routes.friendship_route import friendship_bp
    app.register_blueprint(friendship_bp)

    from app.routes.message_route import message_bp
    app.register_blueprint(message_bp)

    from app.routes.notification_route import notification_bp
    app.register_blueprint(notification_bp)

    @app.route('/')
    def index():
        return "Bağlantı Başarılı"

    return app
