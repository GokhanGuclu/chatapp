import eventlet
eventlet.monkey_patch()

from app import create_app
from app.socket import socketio

app = create_app()

if __name__ == "__main__":
    socketio.init_app(app)
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True) 
