# Import necessary libraries
from email.mime.base import MIMEBase
from email import encoders
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import json
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from twilio.rest import Client
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import traceback

# Load environment variables from .env file
load_dotenv()
app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload-logo', methods=['POST'])
def upload_logo():
    if 'logo' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['logo']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid or no selected file"}), 400

    filename = secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({"logoUrl": f"/uploads/{filename}"}), 200

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Helper function to send email
def send_email(to, file_path, content):
    if not os.path.exists(file_path):
        raise FileNotFoundError("PDF file not found")

    sender_email = os.getenv('SMTP_USER')
    sender_password = os.getenv('SMTP_PASS')

    # Create email
    msg = MIMEMultipart()
    msg['Subject'] = 'Your Supermarket Store Receipt'
    msg['From'] = sender_email
    msg['To'] = to
    
    
    # Email body
    html_body = f"""
    <h2>Receipt Details</h2>
    <table border="1">
        <tr><th>Item</th><th>Price</th><th>Quantity</th><th>Subtotal</th></tr>
    """
    for item in content.get('items', []):
        html_body += f"""
        <tr>
            <td>{item['name']}</td>
            <td>PHP {item['price']}</td>
            <td>{item['quantity']}</td>
            <td>PHP {item['price'] * item['quantity']:.2f}</td>
        </tr>
        """
    html_body += f"""
        </table>
        <p><strong>Total Amount: PHP {content.get('total', 0):.2f}</strong></p>
    
        <hr>
        <p style="font-size:16px; text-align:center;">
            <strong>Thank you for shopping with us!</strong> <br>
            Visit us again soon! 😊
        </p>
    """
    
    msg.attach(MIMEText(html_body, 'html'))
    
    # Attach PDF
    with open(file_path, "rb") as attachment:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", "attachment; filename=receipt.pdf")
        msg.attach(part)
    
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

# Helper function to send SMS
def send_sms(to, content):
    account_sid = os.getenv('TWILIO_SID')
    auth_token = os.getenv('TWILIO_TOKEN')
    client = Client(account_sid, auth_token)

    sms_body = "Receipt Details:\n"
    for item in content.get('items', []):
        sms_body += f"{item['name']} - PHP {item['price']} x {item['quantity']}\n"
    sms_body += f"Total: PHP {content.get('total', 0):.2f}"

    client.messages.create(body=sms_body, from_=os.getenv('TWILIO_PHONE'), to=to)

# Validation functions
def validate_email(email):
    return re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email)

def validate_phone(phone):
    return re.match(r'^\+?[1-9]\d{1,14}$', phone)

@app.route('/send-receipt', methods=['POST'])
def handle_receipt():
    try:
        recipient = request.form.get('recipient')
        method = request.form.get('method')
        content = request.form.get('content')
        pdf_file = request.files.get('pdf')
        
        if not recipient or not method or not content or not pdf_file:
            return jsonify({"error": "Missing recipient, method, content, or PDF"}), 400
        
        try:
            content = json.loads(content) if isinstance(content, str) else content
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON format in content"}), 400
        
        if not isinstance(content, dict):
            return jsonify({"error": "Content must be a dictionary"}), 400
        
        # Validate recipient
        if method == 'email' and not validate_email(recipient):
            return jsonify({"error": "Invalid email address"}), 400
        elif method == 'sms' and not validate_phone(recipient):
            return jsonify({"error": "Invalid phone number"}), 400
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'receipt.pdf')
        pdf_file.save(file_path)
        
        # Send receipt
        if method == 'email':
            send_email(recipient, file_path, content)
        elif method == 'sms':
            send_sms(recipient, content)
        else:
            return jsonify({"error": "Invalid method"}), 400

        return jsonify({"status": "success"})
    
    except Exception as e:
        logging.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
