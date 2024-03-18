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
from models.admin import Admin

AUTH = Auth()


@app_views.route('/admins', methods=['POST'], strict_slashes=False)
def admins():
    """reg admin"""
    try:
        email = request.form.get('email')
        password = request.form.get('password')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')

        if not email or not password:
            return jsonify({"message": "Missing email or password"}), 400

        AUTH.register_admin(email, password, first_name, last_name)
        return jsonify({"email": email, "message": "admin created"})

    except ValueError:
        return jsonify({"message": "email already registered"}), 400


@app_views.route('/admins/<admin_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/admin/put_admin.yml', methods=['PUT'])
def put_admin(admin_id):
    """
    Updates a admin
    """
    admin = storage.get(Admin, admin_id)

    if not admin:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'email', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            setattr(admin, key, value)
    storage.save()
    return make_response(jsonify(admin.to_dict()), 200)


@app_views.route('/sessions', methods=['POST'], strict_slashes=False)
def login_a():
    """login route"""
    try:
        email = request.form.get('email')
        password = request.form.get('password')

        if AUTH.valid_login_a(email, password):
            session_id = AUTH.create_session_a(email)

            # Set the session ID as a cookie in the response
            response = make_response(
                jsonify({"email": email, "message": "logged in"}))
            response.set_cookie("session_id", session_id)

            return response

        # Incorrect login information
        return abort(401)

    except NoResultFound:
        # admin not found
        return jsonify({"message": "admin not found"}), 401


@app_views.route('/sessions', methods=['DELETE'], strict_slashes=False)
def logout_a():
    """ logout route"""
    session_id = request.cookies.get('session_id')
    if session_id:
        admin = AUTH.get_admin_from_session_id(session_id)
        if admin:
            AUTH.destroy_session_a(admin.id)
            return redirect(url_for('index'))
    abort(403)


@app_views.route('/profile', methods=['GET'], strict_slashes=False)
def profile_a():
    """Profile route"""
    session_id = request.cookies.get('session_id')
    if session_id:
        admin = AUTH.get_admin_from_session_id(session_id)
        if admin:
            return jsonify({"email": admin.email}), 200
    abort(403)


@app_views.route('/reset_password', methods=['POST'], strict_slashes=False)
def get_reset_password_token_a():
    """get reset password token"""
    email = request.form.get('email')
    if email:
        try:
            reset_token = AUTH.get_reset_password_token_a(email)
            return (
                jsonify({"email": email, "reset_token": reset_token}), 200)
        except ValueError:
            abort(403)


@app_views.route('/reset_password', methods=['PUT'], strict_slashes=False)
def update_password_a():
    """update password"""
    email = request.form.get('email')
    reset_token = request.form.get('reset_token')
    new_password = request.form.get('new_password')
    if email and reset_token and new_password:
        try:
            AUTH.update_password_a(reset_token, new_password)
            return (jsonify({"email": email,
                             "message": "Password updated"}), 200)
        except Exception:
            abort(403)


@app_views.route('/admins', methods=['GET'], strict_slashes=False)
@swag_from('documentation/admin/all_admins.yml')
def get_admins():
    """
    Retrieves the list of all admin objects
    or a specific admin
    """
    all_admins = storage.all(Admin).values()
    list_admins = []
    for admin in all_admins:
        list_admins.append(admin.to_dict())
    return jsonify(list_admins)


@app_views.route('/admins/<admin_id>', methods=['DELETE'],
                 strict_slashes=False)
@swag_from('documentation/admin/delete_admin.yml', methods=['DELETE'])
def delete_admin(admin_id):
    """
    Deletes a admin Object
    """

    admin = storage.get(Admin, admin_id)

    if not admin:
        abort(404)

    storage.delete(admin)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/admins/<admin_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/admin/get_admin.yml', methods=['GET'])
def get_admin(admin_id):
    """ Retrieves a admin with a particular id """
    admin = storage.get(Admin, admin_id)
    # print(admin)
    if not admin:
        abort(404)
    return jsonify(admin.to_dict())
