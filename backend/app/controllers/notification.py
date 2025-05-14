from flask import Blueprint, jsonify, request
from app.models.notification import Notification
from controller.user import User
from app import db
from sqlalchemy import text

notification_bp = Blueprint('notification', __name__, url_prefix='/notification')

@notification_bp.route('/get/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    """Kullanıcının bildirimlerini getir"""
    try:
        sql_get_notifications = text("""
            SELECT * FROM notifications 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC
        """)
        notifications = db.session.execute(sql_get_notifications, {"user_id": user_id}).fetchall()

        notification_list = []
        for notification in notifications:
            notification_list.append({
                'id': notification.id,
                'user_id': notification.user_id,
                'type': notification.type,
                'content': notification.content,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat() if notification.created_at else None
            })

        return jsonify({
            'status': 'success',
            'data': notification_list
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@notification_bp.route('/unread/count/<int:user_id>', methods=['GET'])
def get_unread_count(user_id):
    """Okunmamış bildirim sayısını getir"""
    try:
        sql_count = text("""
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = :user_id AND is_read = 0
        """)
        result = db.session.execute(sql_count, {"user_id": user_id}).fetchone()
        
        return jsonify({
            'status': 'success',
            'count': result.count
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@notification_bp.route('/mark-read/<int:notification_id>', methods=['PUT'])
def mark_as_read(notification_id):
    """Bildirimi okundu olarak işaretle"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({
                'status': 'error',
                'message': 'Kullanıcı ID gerekli'
            }), 400

        sql_update = text("""
            UPDATE notifications 
            SET is_read = 1 
            WHERE id = :notification_id AND user_id = :user_id
        """)
        result = db.session.execute(sql_update, {
            "notification_id": notification_id,
            "user_id": user_id
        })
        db.session.commit()

        if result.rowcount == 0:
            return jsonify({
                'status': 'error',
                'message': 'Bildirim bulunamadı'
            }), 404

        return jsonify({
            'status': 'success',
            'message': 'Bildirim okundu olarak işaretlendi'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@notification_bp.route('/mark-all-read/<int:user_id>', methods=['PUT'])
def mark_all_as_read(user_id):
    """Tüm bildirimleri okundu olarak işaretle"""
    try:
        sql_update = text("""
            UPDATE notifications 
            SET is_read = 1 
            WHERE user_id = :user_id AND is_read = 0
        """)
        db.session.execute(sql_update, {"user_id": user_id})
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Tüm bildirimler okundu olarak işaretlendi'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@notification_bp.route('/debug/<int:user_id>', methods=['GET'])
def debug_notifications(user_id):
    """Debug için bildirimleri getir"""
    try:
        sql_all = text("""
            SELECT * FROM notifications 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC
        """)
        all_notifications = db.session.execute(sql_all, {"user_id": user_id}).fetchall()

        sql_count = text("""
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = :user_id AND is_read = 0
        """)
        unread_count = db.session.execute(sql_count, {"user_id": user_id}).fetchone()

        notification_list = []
        for notification in all_notifications:
            notification_list.append({
                'id': notification.id,
                'type': notification.type,
                'content': notification.content,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat() if notification.created_at else None
            })

        return jsonify({
            'status': 'success',
            'total_notifications': len(notification_list),
            'unread_count': unread_count.count,
            'notifications': notification_list
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@notification_bp.route('/mark_read', methods=['POST'])
def mark_notification_read_by_friendship():
    """Friendship ID'ye göre bildirimi okundu olarak işaretle"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        friendship_id = data.get('friendship_id')

        if not user_id or not friendship_id:
            return jsonify({
                'status': 'error',
                'message': 'Kullanıcı ID ve Friendship ID gerekli'
            }), 400

        sql_update = text("""
            UPDATE notifications 
            SET is_read = 1 
            WHERE friendship_id = :friendship_id AND user_id = :user_id
        """)
        result = db.session.execute(sql_update, {
            "friendship_id": friendship_id,
            "user_id": user_id
        })
        db.session.commit()

        if result.rowcount == 0:
            return jsonify({
                'status': 'error',
                'message': 'Bildirim bulunamadı'
            }), 404

        sql_count = text("""
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = :user_id AND is_read = 0 AND type = 'friend_request'
        """)
        unread_result = db.session.execute(sql_count, {"user_id": user_id}).fetchone()
        unread_count = unread_result.count if unread_result else 0

        return jsonify({
            'status': 'success',
            'message': 'Bildirim okundu olarak işaretlendi',
            'unread_count': unread_count
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 