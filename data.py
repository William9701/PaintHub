import requests
import json

# Define the base data
data = {
  "Name": "Green",
  "Description": "sharp Clean",
  "Price": "800",
  "Brand": "Timeless",
  "Category": "Paint",
  "Color": "green",
  "Material": "Satin",
  "Size": "7 liters",
  "ProductImage": "../static/images/acrylic-bucket",
  "ColorImage": "../static/images/pexels-toa-heftiba-şinca-1194420"
}

# Define the endpoint
url = "http://localhost:5001/api/v1/products"

# Send 50 POST requests
for i in range(5):
  # Modify the data as needed
  data['Name'] = "Black " + str(i)
  data['Price'] = str(90 + i)

  # Send the POST request
  response = requests.post(url, headers={"Content-Type": "application/json"}, data=json.dumps(data))

  # Print the response
  print(f"Response for product {i}: {response.status_code}, {response.text}")
