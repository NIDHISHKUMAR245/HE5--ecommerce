import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from db import init_db, get_user_by_email, get_user_by_username, create_user, save_contact_submission, save_order, save_order_item, get_orders_by_user, get_order_items

app = Flask(__name__)
app.config.from_object(Config)

try:
    init_db()
except Exception as e:
    print(f"Warning: Database initialization failed on startup: {e}")

@app.context_processor
def inject_user():
    if 'user_id' in session and 'created_at' not in session:
        try:
            user = get_user_by_email(session.get('email', ''))
            if not user:
                user = get_user_by_username(session.get('username', ''))
            if user and 'created_at' in user:
                session['created_at'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S') if user['created_at'] else 'N/A'
        except Exception as e:
            print(f"Error loading user profile created_at for session: {e}")
    return dict(session=session)

@app.route('/')
@app.route('/landing.html')
def landing():
    return render_template('landing.html')

@app.route('/index.html')
@app.route('/home')
def index():
    return render_template('index.html')

@app.route('/products.html')
def products():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    return render_template('products.html')

@app.route('/blog.html')
def blog():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    return render_template('blog.html')

@app.route('/contact.html')
def contact():
    return render_template('contact.html')

@app.route('/cart.html')
def cart():
    return render_template('cart.html')

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
        
    return render_template('orders.html', orders=user_orders)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
