from email.message import EmailMessage
from email.mime.text import MIMEText  # Add this line
import imghdr
import ssl
import smtplib

email_sender = "williamobi818@gmail.com"
email_password = 'xppc dzoh mzvf ojqg'
email_reciver = 'kleinkelvin818@gmail.com'

subject = "SUb-Testing"

# Assuming cart_contents is a list of dictionaries with each dictionary containing product details
cart_contents = [
    {"product_name": "Product 1", "quantity": 2, "price": 10},
    {"product_name": "Product 2", "quantity": 1, "price": 20},
    # Add more products as needed
]

# Create the HTML for the cart table
cart_html = "<table>"
for item in cart_contents:
    cart_html += f"<tr><td>{item['product_name']}</td><td>{item['quantity']}</td><td>{item['price']}</td></tr>"
cart_html += "</table>"

# Add the company logo
logo_path = "company_logo.png"  # Replace with your actual logo file path
with open(logo_path, 'rb') as img:
    logo_data = img.read()
    logo_type = imghdr.what(img.name)
    logo_name = img.name

em = EmailMessage()

em['From'] = email_sender
em['To'] = email_reciver
em['Subject'] = subject
em.add_attachment(logo_data, maintype='image', subtype=logo_type, cid=logo_name)

body = f'<img src="cid:{logo_name}" alt="Company Logo" style="width: 50px; height: 50px;"><br>{cart_html}'
html_part = MIMEText(body, 'html')  # Create a MIMEText object for the HTML content
em.attach(html_part)  # Attach the HTML content to the email message

context = ssl.create_default_context()

with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
    smtp.login(email_sender, email_password)
    smtp.send_message(em)
