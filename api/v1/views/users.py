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
from models.user import User
from sqlalchemy.orm.attributes import flag_modified

AUTH = Auth()


@app_views.route('/users', methods=['POST'], strict_slashes=False)
def users():
    """reg user"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')

        if not email or not password:
            return jsonify({"message": "Missing email or password"}), 400

        AUTH.register_user(email, password, first_name, last_name)
        return jsonify({"email": email, "message": "user created"})

    except ValueError:
        return jsonify({"message": "email already registered"}), 460


@app_views.route('/users/<user_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/user/put_user.yml', methods=['PUT'])
def put_user(user_id):
    """
    Updates a user
    """
    user = storage.get(User, user_id)

    if not user:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'email', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            if key == "cart_contents":
                # Ensure value is a string (product ID)
                if value not in user.cart_contents:
                    # Append the product ID to the existing cart_contents
                    user.cart_contents.append(value)
                    # Flag the 'cart_contents' attribute as modified
                    flag_modified(user, 'cart_contents')
                else:
                    abort(400, description="Invalid cart_contents value")
            elif key == "purchase_history":
                user.purchase_history.append(value)
                flag_modified(user, 'purchase_history')
            else:
                setattr(user, key, value)

    # Save the updated user to the database
    storage.save()

    return make_response(jsonify(user.to_dict()), 200)


@app_views.route('/users/<user_id>/<product_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/user/put_user.yml', methods=['GET'])
def RemoveFromCart(user_id, product_id):
    user = storage.get(User, user_id)

    if not user:
        abort(404)

    if product_id in user.cart_contents:
        user.cart_contents.remove(product_id)
        flag_modified(user, 'cart_contents')
        del user.cart_contentsQuantity[product_id]
        flag_modified(user, 'cart_contentsQuantity')
    else:
        abort(400, description="Invalid cart_contents value")

    storage.save()

    return make_response(jsonify(user.to_dict()), 200)


@app_views.route('/users/<user_id>/<product_id>/<quantity>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/user/put_user.yml', methods=['GET'])
def addProductQuantity(user_id, product_id, quantity):
    user = storage.get(User, user_id)

    if not user:
        abort(404)
    user.cart_contentsQuantity[product_id] = quantity
    flag_modified(user, 'cart_contentsQuantity')
    storage.save()

    return make_response(jsonify(user.to_dict()), 200)


@app_views.route('/sessions', methods=['POST'], strict_slashes=False)
def login():
    """login route"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if AUTH.valid_login(email, password):
            session_id = AUTH.create_session(email)
            user = AUTH.get_user_from_session_id(session_id)

            # Set the session ID as a cookie in the response
            response = make_response(
                jsonify({"email": email, "user_id": user.id}))
            response.set_cookie("session_id", session_id)

            return response

        # Incorrect login information
        return abort(401)

    except NoResultFound:
        # User not found
        return jsonify({"message": "User not found"}), 401


@app_views.route('/sessions', methods=['DELETE'], strict_slashes=False)
def logout():
    """ logout route"""
    session_id = request.cookies.get('session_id')
    if session_id:
        user = AUTH.get_user_from_session_id(session_id)
        if user:
            AUTH.destroy_session(user.id)
            return redirect(url_for('index'))
    abort(403)


@app_views.route('/profile', methods=['GET'], strict_slashes=False)
def profile():
    """Profile route"""
    session_id = request.cookies.get('session_id')
    if session_id:
        user = AUTH.get_user_from_session_id(session_id)
        if user:
            return jsonify({"email": user.email}), 200
    abort(403)


@app_views.route('/reset_password', methods=['POST'], strict_slashes=False)
def get_reset_password_token():
    """get reset password token"""
    email = request.form.get('email')
    if email:
        try:
            reset_token = AUTH.get_reset_password_token(email)
            return (
                jsonify({"email": email, "reset_token": reset_token}), 200)
        except ValueError:
            abort(403)


@app_views.route('/reset_password', methods=['PUT'], strict_slashes=False)
def update_password():
    """update password"""
    email = request.form.get('email')
    reset_token = request.form.get('reset_token')
    new_password = request.form.get('new_password')
    if email and reset_token and new_password:
        try:
            AUTH.update_password(reset_token, new_password)
            return (jsonify({"email": email,
                             "message": "Password updated"}), 200)
        except Exception:
            abort(403)


@app_views.route('/users', methods=['GET'], strict_slashes=False)
@swag_from('documentation/user/all_users.yml')
def get_users():
    """
    Retrieves the list of all user objects
    or a specific user
    """
    all_users = storage.all(User).values()
    list_users = []
    for user in all_users:
        list_users.append(user.to_dict())
    return jsonify(list_users)


@app_views.route('/users/<user_id>', methods=['DELETE'],
                 strict_slashes=False)
@swag_from('documentation/user/delete_user.yml', methods=['DELETE'])
def delete_user(user_id):
    """
    Deletes a user Object
    """

    user = storage.get(User, user_id)

    if not user:
        abort(404)

    storage.delete(user)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/users/<user_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/user/get_user.yml', methods=['GET'])
def get_user(user_id):
    """ Retrieves a user with a particular id """
    user = storage.get(User, user_id)
    # print(user)
    if not user:
        abort(404)
    return jsonify(user.to_dict())


@app_views.route('/usersCC/<user_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/user/put_user.yml', methods=['PUT'])
def clearCart(user_id):
    """
    Updates a user
    """
    user = storage.get(User, user_id)

    if not user:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'email', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            if key == "cart_contents":
                user.cart_contents = []
                user.cart_contentsQuantity = {}
                flag_modified(user, 'cart_contents')
                flag_modified(user, 'cart_contentsQuantity')

    # Save the updated user to the database
    storage.save()

    return make_response(jsonify(user.to_dict()), 200)
