#!/usr/bin/python3
""" objects that handles all default RestFul API actions for comment """
from models.comment import Comment

from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/comments/', methods=['GET'], strict_slashes=False)
@swag_from('documentation/comment/comment_by_content.yml', methods=['GET'])
def get_comments(content_id):
    """
    Retrieves the list of all comment objects
    of a specific content, or a specific comment
    """
    all_comments = storage.all(Comment).values()
    list_comments = []
    for comment in all_comments:
        list_comments.append(comment.to_dict())
    return jsonify(list_comments)


@app_views.route('/comment/<comment_id>/', methods=['GET'], strict_slashes=False)
@swag_from('documentation/comment/get_comment.yml', methods=['GET'])
def get_comment(comment_id):
    """
    Retrieves a specific comment based on id
    """
    comment = storage.get(Comment, comment_id)
    if not comment:
        abort(404)
    return jsonify(comment.to_dict())


@app_views.route('/comment/<comment_id>', methods=['DELETE'], strict_slashes=False)
@swag_from('documentation/comment/delete_comment.yml', methods=['DELETE'])
def delete_comment(comment_id):
    """
    Deletes a comment based on id provided
    """
    comment = storage.get(Comment, comment_id)

    if not comment:
        abort(404)
    storage.delete(comment)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/contents/<user_id>/<content_id>/comment', methods=['POST'],
                 strict_slashes=False)
@swag_from('documentation/comment/post_comment.yml', methods=['POST'])
def post_comment(content_id, user_id):
    """
    Creates a comment
    """
    if not request.get_json():
        abort(400, description="Not a JSON")

    data = request.get_json()
    instance = Comment(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/comment/<comment_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/comment/put_comment.yml', methods=['PUT'])
def put_comment(comment_id):
    """
    Updates a comment
    """
    comment = storage.get(Comment, comment_id)

    if not comment:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            setattr(comment, key, value)
    storage.save()
    return make_response(jsonify(comment.to_dict()), 200)
