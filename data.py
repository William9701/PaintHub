import requests
import json

# Define the base data
data = {
    "Name": "Royal Gold",
    "Description": "Gold Family",
    "Price": "1800",
    "Brand": "Junix",
    "Category": "Wallpaper",
    "Color": "Royal Gold",
    "Material": "Paper",
    "Size": "7 liters",
    "ProductImage": "../static/images/1st_wallpaper_roll-removebg-preview",
    "ColorImage": "../static/images/1st_wallpaper_display.jpeg",
    "QuantityAvailable": "5"
}

# Define the endpoint
url = "http://localhost:5001/api/v1/products"

# Send 50 POST requests
for i in range(1):

    # Send the POST request
    response = requests.post(
        url, headers={"Content-Type": "application/json"}, data=json.dumps(data))

    # Print the response
    print(f"Response for product {i}: {response.status_code}, {response.text}")
