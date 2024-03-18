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
    """reg painter"""
    try:
        email = request.form.get('email')
        password = request.form.get('password')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')

        if not email or not password:
            return jsonify({"message": "Missing email or password"}), 400

        AUTH.register_painter(email, password, first_name, last_name)
        return jsonify({"email": email, "message": "painter created"})

    except ValueError:
        return jsonify({"message": "email already registered"}), 400


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


@app_views.route('/sessions', methods=['POST'], strict_slashes=False)
def login_p():
    """login route"""
    try:
        email = request.form.get('email')
        password = request.form.get('password')

        if AUTH.valid_login_p(email, password):
            session_id = AUTH.create_session_p(email)

            # Set the session ID as a cookie in the response
            response = make_response(
                jsonify({"email": email, "message": "logged in"}))
            response.set_cookie("session_id", session_id)

            return response

        # Incorrect login information
        return abort(401)

    except NoResultFound:
        # painter not found
        return jsonify({"message": "painter not found"}), 401


@app_views.route('/sessions', methods=['DELETE'], strict_slashes=False)
def logout_p():
    """ logout route"""
    session_id = request.cookies.get('session_id')
    if session_id:
        painter = AUTH.get_painter_from_session_id(session_id)
        if painter:
            AUTH.destroy_session_p(painter.id)
            return redirect(url_for('index'))
    abort(403)


@app_views.route('/profile', methods=['GET'], strict_slashes=False)
def profile_p():
    """Profile route"""
    session_id = request.cookies.get('session_id')
    if session_id:
        painter = AUTH.get_painter_from_session_id(session_id)
        if painter:
            return jsonify({"email": painter.email}), 200
    abort(403)


@app_views.route('/reset_password', methods=['POST'], strict_slashes=False)
def get_reset_password_token_p():
    """get reset password token"""
    email = request.form.get('email')
    if email:
        try:
            reset_token = AUTH.get_reset_password_token_p(email)
            return (
                jsonify({"email": email, "reset_token": reset_token}), 200)
        except ValueError:
            abort(403)


@app_views.route('/reset_password', methods=['PUT'], strict_slashes=False)
def update_password_p():
    """update password"""
    email = request.form.get('email')
    reset_token = request.form.get('reset_token')
    new_password = request.form.get('new_password')
    if email and reset_token and new_password:
        try:
            AUTH.update_password_p(reset_token, new_password)
            return (jsonify({"email": email,
                             "message": "Password updated"}), 200)
        except Exception:
            abort(403)


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
