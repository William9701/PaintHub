#!/usr/bin/python3
""" objects that handles all default RestFul API actions for request """
from models.request import Request

from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/requests/', methods=['GET'], strict_slashes=False)
@swag_from('documentation/request/request_by_content.yml', methods=['GET'])
def get_requests():
    """
    Retrieves the list of all request objects
    of a specific content, or a specific request
    """
    all_requests = storage.all(Request).values()
    list_requests = []
    for request in all_requests:
        list_requests.append(request.to_dict())
    return jsonify(list_requests)


@app_views.route('/request/<request_id>/', methods=['GET'], strict_slashes=False)
@swag_from('documentation/request/get_request.yml', methods=['GET'])
def get_request(request_id):
    """
    Retrieves a specific request based on id
    """
    request = storage.get(Request, request_id)
    if not request:
        abort(404)
    return jsonify(request.to_dict())


@app_views.route('/request/<request_id>', methods=['DELETE'], strict_slashes=False)
@swag_from('documentation/request/delete_request.yml', methods=['DELETE'])
def delete_request(request_id):
    """
    Deletes a request based on id provided
    """
    request = storage.get(Request, request_id)

    if not request:
        abort(404)
    storage.delete(request)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/requests', methods=['POST'],
                 strict_slashes=False)
@swag_from('documentation/request/post_request.yml', methods=['POST'])
def post_request():
    """
    Creates a request
    """
    if not request.get_json():
        abort(400, description="Not a JSON")

    data = request.get_json()
    instance = Request(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/requests/<request_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/request/put_request.yml', methods=['PUT'])
def put_request(request_id):
    """
    Updates a request
    """
    request = storage.get(Request, request_id)

    if not request:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            setattr(request, key, value)
    storage.save()
    return make_response(jsonify(request.to_dict()), 200)
