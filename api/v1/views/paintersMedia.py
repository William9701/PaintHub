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
from models.painterMedia import PaintersMedia
from sqlalchemy.orm.attributes import flag_modified
from urllib.parse import unquote


@app_views.route('/paintersMedia', methods=['POST'], strict_slashes=False)
@swag_from('documentation/product/post_product.yml', methods=['POST'])
def post_paintersMedia():
    """
    Creates a media
    """
    if not request.get_json():
        abort(400, description="Not a JSON")

    data = request.get_json()
    instance = PaintersMedia(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/paintersMedias/<painters_id>/<attr>/', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/paintersMedia/put_paintersMedia.yml', methods=['PUT'])
def put_paintersMedia(painters_id, attr):
    """
    Updates a paintersMedia
    """
    paintersMedia = storage.getMedia(PaintersMedia, painters_id)

    if not paintersMedia:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'email', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            if value not in getattr(paintersMedia, attr, None):
                # Append the product ID to the existing photos
                getattr(paintersMedia, attr, None).append(value)
                # Flag the 'photos' attribute as modified
                flag_modified(paintersMedia, attr)
            else:
                abort(400, description="Invalid photos value")
        else:
            abort(401)
    storage.save()

    return make_response(jsonify(paintersMedia.to_dict()), 200)


@app_views.route('/paintersMediaP', methods=['POST'], strict_slashes=False)
@swag_from('documentation/user/put_user.yml', methods=['PUT'])
def RemoveMedia():
    if not request.is_json:
            abort(400, description="Not a JSON")

    data = request.get_json()
    painter_id = data.get('painter_id')
    src = data.get('src')
    attr = data.get('attr')


    print(painter_id)
    painter = storage.getMedia(PaintersMedia, painter_id)
    print('i am here')

    if not painter:
        abort(404)

    if src in getattr(painter, attr, None):
        getattr(painter, attr, None).remove(src)
        flag_modified(painter, attr)
    else:
        abort(400, description="Invalid src value")

    storage.save()

    return make_response(jsonify(painter.to_dict()), 200)
