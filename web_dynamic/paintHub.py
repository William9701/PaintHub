from flask import redirect, url_for, session
from flask import request, jsonify
import os
import uuid
from flask import flash, abort, redirect, url_for
import subprocess
from models import storage
from models.painterMedia import PaintersMedia
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
from builtins import set as built_in_set
from geopy.geocoders import Nominatim
from geopy.distance import geodesic


app = Flask(__name__)
app.jinja_env.globals.update(datetime=datetime)
app.config['STRIPE_PUBLIC_KEY'] = 'pk_test_51OwhfcRtCndOdsDR7LrgHrEyoGEhYXuVQzWYP3lahOGuO3lzWmvGm2F0YBZ2WONysCOPpVhWmva2dh1hvFPk0dJR00lI9qvCXD'
app.config['STRIPE_SECRET_KEY'] = 'sk_test_51OwhfcRtCndOdsDR5Xvix21H1cW2ilvstT0BIpn7vk5XYMvPqEx9k1nm9gJ5E8KWuJlspsFhQGvAflSmJ0idvfq000pPIjCMMf'

stripe.api_key = app.config['STRIPE_SECRET_KEY']

# Add the built-in set function to the Jinja environment globals
app.jinja_env.globals.update(set=built_in_set)


@app.route('/stripe_pay', methods=['POST'])
def stripe_pay():
    # Assuming payment_cart is passed in the request body as JSON
    payment_cart = request.json

    line_items = []
    for item in payment_cart:
        line_item = {
            'price': item['price'],
            'quantity': int(item['quantity']),  # Convert quantity to integer
        }
        line_items.append(line_item)

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=line_items,
        mode='payment',
        success_url=url_for('index', _external=True) +
        '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url=url_for('index', _external=True),
    )
    return jsonify({
        'checkout_session_id': session['id'],
        'checkout_public_key': app.config['STRIPE_PUBLIC_KEY']
    })


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


@app.route('/generate_stripe_id/<name>/<P_price>/<description>', strict_slashes=False)
def GenerateStripeId(name, P_price, description):
    unit_amount_cents = int(float(P_price) * 100)
    product = stripe.Product.create(
        name=name,
        description=description,
        active=True
    )

    # Create a price for the product
    price = stripe.Price.create(
        product=product.id,
        unit_amount=unit_amount_cents,
        currency='usd'
    )
    return jsonify({"price_id": price.id})


@app.route('/getStripeId/<product_id>', strict_slashes=False)
def getStripeId(product_id):
    stripeId = storage.getStripId(Product, product_id)
    if stripeId:
        return jsonify({"id": stripeId})
    print('Not found')
    abort(401)


@app.route('/update_price/<price_id>/<new_price>', strict_slashes=False)
def update_price(price_id, new_price):
    try:
        # Retrieve the current price
        price = stripe.Price.retrieve(price_id)

        # Create a new price with the updated amount
        new_price_obj = stripe.Price.create(
            unit_amount=int(float(new_price) * 100),  # Convert new_price to cents
            currency=price.currency,
            product=price.product,
            lookup_key=price.lookup_key,  # Preserve the existing lookup key
        )

        

        return jsonify({'newPrice': new_price_obj.id})
    except stripe.error.InvalidRequestError as e:
        return jsonify({'error': str(e)})



# Custom function to extract unique categories
def get_unique_categories(products):
    unique_categories = set(product['category'] for product in products)
    return unique_categories


# Add the custom function to the Jinja environment globals
app.jinja_env.globals.update(get_unique_categories=get_unique_categories)


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


def getTotal(price, quantity):
    return int(price) * int(quantity)


app.jinja_env.globals.update(getTotal=getTotal)


@app.route('/paintersPage/<painter_id>', strict_slashes=False)
def paintersPage(painter_id):
    painter = storage.get(Painter, painter_id)
    if not painter:
        abort(404)
    paintersMedia = storage.getMedia(PaintersMedia, painter_id)
    return render_template('paintersPage.html', painter=painter, paintersMedia=paintersMedia)


@app.route('/payment/<user_id>', strict_slashes=False)
def payment(user_id):
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    cartContent = []
    for product in user.cart_contents:
        fullProduct = storage.get(Product, product)
        cartContent.append(fullProduct)
    products = storage.all(Product).values()
    return render_template('payment.html', user=user, products=products, cartContent=cartContent)


@app.teardown_appcontext
def close_db(error):
    """ Remove the current SQLAlchemy Session """
    storage.close()


@app.route('/painterLogin', strict_slashes=False)
def paintersLogin():
    return render_template('painterLogin.html')


@app.route('/paintersProfile/<painters_id>', strict_slashes=False)
def paintersProfile(painters_id):
    painter = storage.get(Painter, painters_id)
    if not painter:
        abort(404)
    paintersMedia = storage.getMedia(PaintersMedia, painters_id)
    return render_template('paintersProfile.html', painter=painter, paintersMedia=paintersMedia)


@app.route('/painterReg', strict_slashes=False)
def painterReg():
    return render_template('painterReg.html')


@app.route('/', strict_slashes=False)
def index():
    products = storage.all(Product).values()
    painters = storage.all(Painter).values()
    return render_template('index.html', products=products, painters=painters)


@app.route('/upload_video', methods=['POST'], strict_slashes=False)
def upload_file():
    file = request.files['file']
    save_path = os.path.join(os.pardir, 'paintHub', 'web_dynamic',
                             'static', 'PaintersMedia', 'Videos', file.filename)
    file.save(save_path)
    # Construct the relative URL of the saved file
    file_url = '../static/PaintersMedia/Videos/' + file.filename

    return jsonify({"file_url": file_url}), 200


@app.route('/check/<painter_id>', methods=['GET'], strict_slashes=False)
def checke(painter_id):
    painter = storage.getMedia(PaintersMedia, painter_id)
    if painter:
        return jsonify({"reply": True})
    return jsonify({"reply": False})


@app.route('/upload_photo', methods=['POST'], strict_slashes=False)
def upload_file_photo():
    file = request.files['file']
    save_path = os.path.join(os.pardir, 'paintHub', 'web_dynamic',
                             'static', 'PaintersMedia', 'Images', file.filename)
    file.save(save_path)
    # Construct the relative URL of the saved file
    file_url = '../static/PaintersMedia/Images/' + file.filename

    return jsonify({"file_url": file_url}), 200


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
    painters = storage.all(Painter).values()
    if not user:
        abort(401)
    return render_template('index.html', user=user, products=products, painters=painters)


def get_coordinates(city):
    geolocator = Nominatim(user_agent="geo_distance_calculator")
    location = geolocator.geocode(city)
    if location:
        return location.latitude, location.longitude
    else:
        return None


@app.route('/CalculateDistance/<city>', strict_slashes=False)
def calculate_distance(city):
    coordinates1 = get_coordinates(city)
    coordinates2 = get_coordinates('Asaba')

    if coordinates1 and coordinates2:
        distance = geodesic(coordinates1, coordinates2).kilometers
        return calculate_delivery_cost(distance)
    else:
        return "Unable to retrieve coordinates for one or both cities."


def calculate_delivery_cost(distance):
    initial_cost = 50  # Initial cost for the first range
    increment = 10  # Distance increment for each range
    num_ranges = int(distance) // increment  # Number of ranges
    delivery_cost = 0

    for i in range(num_ranges + 1):
        range_start = i * increment
        if distance <= range_start + increment:  # Adjusted condition
            delivery_cost = initial_cost
            break
        initial_cost += 50  # Assuming a $50 increment for each range

    return jsonify({'delivery_cost': delivery_cost})


if __name__ == "__main__":
    """ Main Function """
    app.run(host='0.0.0.0', port=5000, debug=True)
