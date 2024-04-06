#!/usr/bin/python3
""" objects that handle all default RestFul API actions for products """
from models.product import Product
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/products', methods=['GET'], strict_slashes=False)
@swag_from('documentation/product/get_product.yml', methods=['GET'])
def get_products():
    """
    Retrieves the list of all product objects
    """
    all_products = storage.all(Product).values()
    list_products = []
    for product in all_products:
        list_products.append(product.to_dict())
    return jsonify(list_products)


@app_views.route('/product/<product_info>/<searchValue>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/product_info/get_product.yml', methods=['GET'])
def get_products_with_info(product_info, searchValue):
    """
    Retrieves the list of all product objects
    """
    all_products = storage.all(Product).values()
    list_products = []
    for product in all_products:
        if getattr(product, product_info, None) == searchValue:
            list_products.append(product.to_dict())

    return jsonify(list_products)


@app_views.route('/getProduct', methods=['POST'], strict_slashes=False)
@swag_from('documentation/product_info/get_product.yml', methods=['POST'])
def get_products_with_srcinfo():
    if not request.get_json():
        abort(400, description="Not a JSON")

    data = request.get_json()
    print(data)
    Imagesrc = data['src']
    Imagesrc = Imagesrc.replace("http://127.0.0.1:5000", "..")
    print(Imagesrc)
    all_products = storage.all(Product).values()
    for product in all_products:
        if product.ProductImage == Imagesrc:
            return jsonify(product.to_dict())
    abort(400)


@app_views.route('/products/<product_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/product/get_id_product.yml', methods=['get'])
def get_product(product_id):
    """ Retrieves a specific product """
    product = storage.get(Product, product_id)
    if not product:
        abort(404)

    return jsonify(product.to_dict())


@app_views.route('/products/<product_id>', methods=['DELETE'],
                 strict_slashes=False)
@swag_from('documentation/product/delete_product.yml', methods=['DELETE'])
def delete_product(product_id):
    """
    Deletes a product Object
    """

    product = storage.get(Product, product_id)

    if not product:
        abort(404)

    storage.delete(product)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/products', methods=['POST'], strict_slashes=False)
@swag_from('documentation/product/post_product.yml', methods=['POST'])
def post_product():
    """
    Creates a product
    """
    if not request.get_json():
        abort(400, description="Not a JSON")

    data = request.get_json()
    instance = Product(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/products/<product_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/product/put_product.yml', methods=['PUT'])
def put_product(product_id):
    """
    Updates a product
    """
    product = storage.get(Product, product_id)

    if not product:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            setattr(product, key, value)
    storage.save()
    return make_response(jsonify(product.to_dict()), 200)
