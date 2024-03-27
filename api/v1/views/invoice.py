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
from models.invoice import Invoice
from sqlalchemy.orm.attributes import flag_modified
from urllib.parse import unquote


@app_views.route('/invoice', methods=['POST'], strict_slashes=False)
@swag_from('documentation/invoice/post_invoice.yml', methods=['POST'])
def post_invoice():
    """
    Creates a media
    """
    if not request.get_json():
        abort(400, description="Not a JSON")

    data = request.get_json()
    instance = Invoice(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/invoice/<invoice_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/invoice/put_invoice.yml', methods=['PUT'])
def put_invoice(invoice_id):
    """
    Updates an invoice
    """
    invoice = storage.get(Invoice, invoice_id)

    if not invoice:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'email', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            if value not in invoice.productCart:
                # Append the invoice ID to the existing carts
                invoice.productCart.append(value)
                # Flag the 'photos' attribute as modified
                flag_modified(invoice, 'productCart')
            else:
                abort(400, description="Invalid photos value")
        else:
            abort(401)
    storage.save()

    return make_response(jsonify(invoice.to_dict()), 200)


@app_views.route('/invoicep/<invoice_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/invoice/put_invoice.yml', methods=['PUT'])
def put_invoicep(invoice_id):
    """
    Updates a invoice
    """
    invoice = storage.get(Invoice, invoice_id)

    if not invoice:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            setattr(invoice, key, value)
    storage.save()
    return make_response(jsonify(invoice.to_dict()), 200)
