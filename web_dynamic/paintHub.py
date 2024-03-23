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
import stripe

import requests
import pytz

app = Flask(__name__)
app.jinja_env.globals.update(datetime=datetime)
app.config['STRIPE_PUBLIC_KEY'] = 'pk_test_51OwhfcRtCndOdsDR7LrgHrEyoGEhYXuVQzWYP3lahOGuO3lzWmvGm2F0YBZ2WONysCOPpVhWmva2dh1hvFPk0dJR00lI9qvCXD'
app.config['STRIPE_SECRET_KEY'] = 'sk_test_51OwhfcRtCndOdsDR5Xvix21H1cW2ilvstT0BIpn7vk5XYMvPqEx9k1nm9gJ5E8KWuJlspsFhQGvAflSmJ0idvfq000pPIjCMMf'

stripe.api_key = app.config['STRIPE_SECRET_KEY']


@app.route('/stripe_pay')
def stripe_pay():

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': 'price_1OwuGPRtCndOdsDRIzMEEh1k',
            'quantity': 4,
        }],
        mode='payment',
        success_url=url_for('index', _external=True) +
        '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url=url_for('index', _external=True),
    )
    return {
        'checkout_session_id': session['id'],
        'checkout_public_key': app.config['STRIPE_PUBLIC_KEY']
    }


@app.route('/stripe_webhook', methods=['POST'])
def stripe_webhook():
    print('WEBHOOK CALLED')

    if request.content_length > 1024 * 1024:
        print('REQUEST TOO BIG')
        abort(400)
    payload = request.get_data()
    sig_header = request.environ.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = 'whsec_eb87da713896ee92be05a319d0990c52b6a80e34a5925c42e458f803922ffcc1'
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        print('INVALID PAYLOAD')
        return {}, 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print('INVALID SIGNATURE')
        return {}, 400

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        print(session)
        print('i am here')
        line_items = stripe.checkout.Session.list_line_items(
            session['id'], limit=1)
        print(line_items['data'][0]['description'])

    return {}


@app.route('/generate_stripe_id', strict_slashes=False)
def GenerateStripeId():
    product = stripe.Product.create(
        name='Brown Paint',
        description='Good paint',
        active=True
    )

    # Create a price for the product
    price = stripe.Price.create(
        product=product.id,
        unit_amount=4306,
        currency='usd'
    )
    return jsonify({"price_id": price.id})


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


@app.route('/paintersProfile', strict_slashes=False)
def paintersProfile():
    return render_template('paintersProfile.html')


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

@app.route('/paintersLogin', strict_slashes=False)
def paintersLogin():
	return render_template('paintersLogin.html')


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
