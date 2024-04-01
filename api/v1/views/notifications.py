#!/usr/bin/python3
""" objects that handles all default RestFul API actions for notification """
from models.notification import Notification

from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/notifications/', methods=['GET'], strict_slashes=False)
@swag_from('documentation/notification/notification_by_content.yml', methods=['GET'])
def get_notifications():
    """
    Retrieves the list of all notification objects
    of a specific content, or a specific notification
    """
    all_notifications = storage.all(Notification).values()
    list_notifications = []
    for notification in all_notifications:
        list_notifications.append(notification.to_dict())
    return jsonify(list_notifications)


@app_views.route('/notifications/<user_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/notification/notification_by_content.yml', methods=['GET'])
def get_user_notifications(user_id):
    """
    Retrieves the list of all notification objects
    of a specific user
    """
    all_notifications = storage.all(Notification).values()
    list_notifications = []
    for notification in all_notifications:
        if notification.user_id == user_id:
            list_notifications.append(notification.to_dict())

    return jsonify(list_notifications)


@app_views.route('/notification/<notification_id>/', methods=['GET'], strict_slashes=False)
@swag_from('documentation/notification/get_notification.yml', methods=['GET'])
def get_notification(notification_id):
    """
    Retrieves a specific notification based on id
    """
    notification = storage.get(Notification, notification_id)
    if not notification:
        abort(404)
    return jsonify(notification.to_dict())


@app_views.route('/notification/<notification_id>', methods=['DELETE'], strict_slashes=False)
@swag_from('documentation/notification/delete_notification.yml', methods=['DELETE'])
def delete_notification(notification_id):
    """
    Deletes a notification based on id provided
    """
    notification = storage.get(Notification, notification_id)

    if not notification:
        abort(404)
    storage.delete(notification)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/notification', methods=['POST'],
                 strict_slashes=False)
@swag_from('documentation/notification/post_notification.yml', methods=['POST'])
def post_notification():
    """
    Creates a notification
    """
    if not request.get_json():
        abort(400, description="Not a JSON")

    data = request.get_json()
    instance = Notification(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/notification/<notification_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/notification/put_notification.yml', methods=['PUT'])
def put_notification(notification_id):
    """
    Updates a notification
    """
    notification = storage.get(Notification, notification_id)

    if not notification:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            setattr(notification, key, value)
    storage.save()
    return make_response(jsonify(notification.to_dict()), 200)
