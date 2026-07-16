import mysql.connector
from mysql.connector import errorcode
from config import Config

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

def init_db():
    """Creates the database and tables if they don't exist."""
    # 1. Connect without DB to create DB if missing
    try:
        conn = get_mysql_connection(use_db=False)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DB}")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Could not create database {Config.MYSQL_DB}: {e}")
        return False

    # 2. Connect with DB to create tables
    try:
        conn = get_mysql_connection(use_db=True)
        cursor = conn.cursor()

        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create contact_submissions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contact_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                gender VARCHAR(20),
                subject VARCHAR(50) NOT NULL,
                order_number VARCHAR(50),
                message TEXT NOT NULL,
                newsletter TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create orders table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) NOT NULL UNIQUE,
                tracking_id VARCHAR(50) NOT NULL,
                buyer_name VARCHAR(100) NOT NULL,
                buyer_phone VARCHAR(20) NOT NULL,
                buyer_email VARCHAR(100) NOT NULL,
                buyer_address TEXT NOT NULL,
                buyer_city VARCHAR(50) NOT NULL,
                buyer_pincode VARCHAR(10) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                user_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """)

        # Create order_items table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) NOT NULL,
                product_name VARCHAR(100) NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
            )
        """)

        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialized successfully!")
        return True
    except Exception as e:
        print(f"Error initializing tables: {e}")
        return False

# User operations
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

# Contact operations
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

# Order operations
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

# Retrieve orders for a user
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

# Retrieve items for a specific order
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

