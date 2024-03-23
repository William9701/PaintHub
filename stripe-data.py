import stripe

# Set your Stripe API key
stripe.api_key = 'sk_test_51OwhfcRtCndOdsDR5Xvix21H1cW2ilvstT0BIpn7vk5XYMvPqEx9k1nm9gJ5E8KWuJlspsFhQGvAflSmJ0idvfq000pPIjCMMf'


# Create a new product
product = stripe.Product.create(
    name='Awesome Paint',
    description='Good paint',
    active=True
)

# Create a price for the product
price = stripe.Price.create(
    product=product.id,  # Use the product ID
    unit_amount=436,    # Set the price amount (in cents)
    currency='usd'      # Specify the currency
)

# Extract the product and price IDs
product_id = product.id
price_id = price.id
print(f"Product ID: {product_id}")
print(f"Price ID: {price_id}")