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

import requests
import pytz

app = Flask(__name__)
app.jinja_env.globals.update(datetime=datetime)


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
