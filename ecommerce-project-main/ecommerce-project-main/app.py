import os
import mysql.connector
from mysql.connector import errorcode
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

def get_mysql_connection(use_db=True):
    """Establishes connection to MySQL. If use_db is True, connects to the specific database."""
    try:
        if use_db:
            return mysql.connector.connect(
                host=Config.MYSQL_HOST,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DB
            )
        else:
            return mysql.connector.connect(
                host=Config.MYSQL_HOST,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD
            )
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        raise err

def get_user_by_email(email):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user
    except Exception as e:
        print(f"Error fetching user by email: {e}")
        return None

def get_user_by_username(username):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user
    except Exception as e:
        print(f"Error fetching user by username: {e}")
        return None

def create_user(username, email, hashed_password):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed_password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return user_id
    except Exception as e:
        print(f"Error creating user: {e}")
        return None

def save_contact_submission(name, email, phone, gender, subject, order_number, message, newsletter):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO contact_submissions 
            (name, email, phone, gender, subject, order_number, message, newsletter) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (name, email, phone, gender, subject, order_number, message, 1 if newsletter else 0)
        )
        conn.commit()
        sub_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return sub_id
    except Exception as e:
        print(f"Error saving contact submission: {e}")
        return None

def save_order(order_id, tracking_id, buyer_name, buyer_phone, buyer_email, buyer_address, buyer_city, buyer_pincode, payment_method, total_amount, user_id=None):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO orders 
            (order_id, tracking_id, buyer_name, buyer_phone, buyer_email, buyer_address, buyer_city, buyer_pincode, payment_method, total_amount, user_id) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (order_id, tracking_id, buyer_name, buyer_phone, buyer_email, buyer_address, buyer_city, buyer_pincode, payment_method, total_amount, user_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error saving order: {e}")
        return False

def save_order_item(order_id, product_name, quantity, price):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO order_items 
            (order_id, product_name, quantity, price) 
            VALUES (%s, %s, %s, %s)
            """,
            (order_id, product_name, quantity, price)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error saving order item: {e}")
        return False

def get_orders_by_user(user_id):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
        orders = cursor.fetchall()
        cursor.close()
        conn.close()
        return orders
    except Exception as e:
        print(f"Error fetching orders by user: {e}")
        return []

def get_order_items(order_id):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM order_items WHERE order_id = %s", (order_id,))
        items = cursor.fetchall()
        cursor.close()
        conn.close()
        return items
    except Exception as e:
        print(f"Error fetching order items: {e}")
        return []



@app.route('/')
@app.route('/landing.html')
def landing():
    return render_template('landing.html')

@app.route('/index.html')
@app.route('/home')
def index():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    user_id = session['user_id']
    return render_template('index.html', user_id=user_id)

@app.route('/products.html')
def products():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    user_id = session['user_id']
    return render_template('products.html', user_id=user_id)

@app.route('/blog.html')
def blog():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    user_id = session['user_id']
    return render_template('blog.html', user_id=user_id)

@app.route('/contact.html')
def contact():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    user_id = session['user_id']
    return render_template('contact.html', user_id=user_id)

@app.route('/cart.html')
def cart():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    user_id = session['user_id']
    return render_template('cart.html', user_id=user_id)

@app.route('/signup', methods=['GET', 'POST'])
@app.route('/signup.html', methods=['GET', 'POST'])
def signup():
    if session.get('user_id'):
        return redirect(url_for('index'))
        
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        if not username or not email or not password:
            error = "All fields are required."
        elif len(username) < 3:
            error = "Username must be at least 3 characters."
        elif len(password) < 6:
            error = "Password must be at least 6 characters."
        elif password != confirm_password:
            error = "Passwords do not match."
        elif get_user_by_username(username):
            error = "Username is already taken."
        elif get_user_by_email(email):
            error = "Email is already registered."
        else:
            hashed_pw = generate_password_hash(password)
            user_id = create_user(username, email, hashed_pw)
            if user_id:
                session['user_id'] = user_id
                session['username'] = username
                session['email'] = email
                user = get_user_by_username(username)
                if user and 'created_at' in user:
                    session['created_at'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S') if user['created_at'] else 'N/A'
                return redirect(url_for('index'))
            else:
                error = "An error occurred during registration. Please try again."
                
    return render_template('signup.html', error=error)

@app.route('/login', methods=['GET', 'POST'])
@app.route('/login.html', methods=['GET', 'POST'])
def login():
    if session.get('user_id'):
        return redirect(url_for('index'))
        
    error = None
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        
        if not email or not password:
            error = "All fields are required."
        else:
            user = get_user_by_email(email)
            if not user:
                
                user = get_user_by_username(email)
                

            if user and check_password_hash(user['password'], password):
                session['user_id'] = user['id']
                session['username'] = user['username']
                session['email'] = user['email']
                session['created_at'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S') if user.get('created_at') else 'N/A'
                return redirect(url_for('index'))
            else:
                error = "Invalid username/email or password."
                
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('landing'))


@app.route('/api/contact', methods=['POST'])
def api_contact():
    if not session.get('user_id'):
        return jsonify({'success': False, 'message': 'Unauthorized. Please login.'}), 401
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided.'}), 400
            
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        gender = data.get('gender', '')
        subject = data.get('subject', '')
        order_number = data.get('order_number', '').strip()
        message = data.get('message', '').strip()
        newsletter = data.get('newsletter', False)
        
        if not name or not email or not subject or not message:
            return jsonify({'success': False, 'message': 'Required fields are missing.'}), 400
            
        sub_id = save_contact_submission(name, email, phone, gender, subject, order_number, message, newsletter)
        if sub_id:
            return jsonify({'success': True, 'message': 'Contact message saved.'}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to save contact message to database.'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/order', methods=['POST'])
def api_order():
    if not session.get('user_id'):
        return jsonify({'success': False, 'message': 'Unauthorized. Please login.'}), 401
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No order data provided.'}), 400
            
        order_id = data.get('order_id')
        tracking_id = data.get('tracking_id')
        buyer_name = data.get('buyer_name', '').strip()
        buyer_phone = data.get('buyer_phone', '').strip()
        buyer_email = data.get('buyer_email', '').strip()
        buyer_address = data.get('buyer_address', '').strip()
        buyer_city = data.get('buyer_city', '').strip()
        buyer_pincode = data.get('buyer_pincode', '').strip()
        payment_method = data.get('payment_method', '')
        total_amount = data.get('total_amount', 0)
        items = data.get('items', [])
        
        if not order_id or not tracking_id or not buyer_name or not buyer_phone or not buyer_email or not buyer_address:
            return jsonify({'success': False, 'message': 'Required billing fields are missing.'}), 400
            
        user_id = session.get('user_id') # Can be None if guest checkout
        
    
        success = save_order(
            order_id, tracking_id, buyer_name, buyer_phone, buyer_email,
            buyer_address, buyer_city, buyer_pincode, payment_method, total_amount, user_id
        )
        
        if not success:
            return jsonify({'success': False, 'message': 'Failed to create order record.'}), 500
            
        
        for item in items:
            save_order_item(order_id, item.get('name'), item.get('qty', 1), item.get('price', 0))
            
        return jsonify({'success': True, 'message': 'Order successfully recorded.'}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/orders')
@app.route('/orders.html')
def orders():
    if not session.get('user_id'):
        return redirect(url_for('login'))
        
    user_id = session['user_id']
    user_orders = get_orders_by_user(user_id)
    
    for order in user_orders:
        order['items'] = get_order_items(order['order_id'])
        
    return render_template('orders.html', orders=user_orders, user_id=user_id)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
