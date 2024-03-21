from flask import redirect, url_for, session
from flask import request, jsonify
import os
import uuid
from flask import flash, abort, redirect, url_for
import subprocess
from models import storage
from models.user import User
from models.admin import Admin
from models.painter import Painter
from models.product import Product
from flask import Flask, render_template, request
from jinja2 import Environment, select_autoescape
from datetime import datetime, timedelta
from flask import jsonify

import requests
import pytz

app = Flask(__name__)
app.jinja_env.globals.update(datetime=datetime)


@app.route('/get_product_quantity/<user_id>/<product_id>', strict_slashes=False)
def CartProductQuantity(user_id, product_id):
    user = storage.get(User, user_id)

    if not user:
        abort(404)

    for key, value in user.cart_contentsQuantity.items():
        if key == product_id:
            return jsonify({"quantity": value})  # Return the quantity as JSON

    return jsonify({"quantity": None})


app.jinja_env.globals.update(CartProductQuantity=CartProductQuantity)


@app.route('/payment/<user_id>', strict_slashes=False)
def payment(user_id):
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    products = storage.all(Product).values()
    return render_template('payment.html', user=user, products=products)


@app.teardown_appcontext
def close_db(error):
    """ Remove the current SQLAlchemy Session """
    storage.close()


@app.route('/', strict_slashes=False)
def index():
    products = storage.all(Product).values()
    return render_template('index.html', products=products)


@app.route('/admin', strict_slashes=False)
def admin():
    return render_template('admin.html')


@app.route('/regUser', strict_slashes=False)
def regUser():
    return render_template('userReg.html')


@app.route('/login', strict_slashes=False)
def login():
    return render_template('userLogin.html')


@app.route('/loginUser/<string:user_id>', strict_slashes=False)
def loginUser(user_id):
    user = storage.get(User, user_id)
    products = storage.all(Product).values()
    if not user:
        abort(401)
    return render_template('index.html', user=user, products=products)


if __name__ == "__main__":
    """ Main Function """
    app.run(host='0.0.0.0', port=5000, debug=True)
