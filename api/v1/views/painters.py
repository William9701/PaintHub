#!/usr/bin/env python3
""" Flask module
"""
from models.engine.auth import Auth
from flask import Flask, jsonify, request, make_response, abort, \
    redirect, url_for
from sqlalchemy.orm.exc import NoResultFound
from api.v1.views import app_views
from flasgger.utils import swag_from
from models import storage
from models.painter import Painter

AUTH = Auth()


@app_views.route('/painters', methods=['POST'], strict_slashes=False)
def painters():
    """Register painter"""
    try:
        data = request.json
        print("Received data:", data)  # Print received data for debugging
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        state = data.get('state')
        city = data.get('city')
        account_status = data.get('account_status')

        if not email or not password:
            return jsonify({"message": "Missing email or password"}), 400

        print("Attempting to register painter...")  # Print debug message
        AUTH.register_painter(email, password, first_name,
                              last_name, state, city, account_status)
        print("Painter registered successfully!")  # Print debug message
        return jsonify({"email": email, "message": "Painter created"})

    except Exception as e:
        print("Error occurred:", e)  # Print error message for debugging
        return jsonify({"message": "An error occurred"}), 400


@app_views.route('/painters/<painter_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/painter/put_painter.yml', methods=['PUT'])
def put_painter(painter_id):
    """
    Updates a painter
    """
    painter = storage.get(Painter, painter_id)

    if not painter:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'email', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            setattr(painter, key, value)
    storage.save()
    return make_response(jsonify(painter.to_dict()), 200)


@app_views.route('/painters', methods=['GET'], strict_slashes=False)
@swag_from('documentation/painter/all_painters.yml')
def get_painters():
    """
    Retrieves the list of all painter objects
    or a specific painter
    """
    all_painters = storage.all(Painter).values()
    list_painters = []
    for painter in all_painters:
        list_painters.append(painter.to_dict())
    return jsonify(list_painters)


@app_views.route('/painters/<painter_id>', methods=['DELETE'],
                 strict_slashes=False)
@swag_from('documentation/painter/delete_painter.yml', methods=['DELETE'])
def delete_painter(painter_id):
    """
    Deletes a painter Object
    """

    painter = storage.get(Painter, painter_id)

    if not painter:
        abort(404)

    storage.delete(painter)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/painters/<painter_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/painter/get_painter.yml', methods=['GET'])
def get_painter(painter_id):
    """ Retrieves a painter with a particular id """
    painter = storage.get(Painter, painter_id)
    # print(painter)
    if not painter:
        abort(404)
    return jsonify(painter.to_dict())
