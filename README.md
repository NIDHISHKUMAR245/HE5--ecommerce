# 🌿 GlowNature - Organic Skincare E-Commerce Website

GlowNature is a full-stack Organic Skincare E-Commerce web application developed using **Flask** and **MySQL**. The platform enables users to browse organic skincare products, manage their shopping cart, place orders, and contact the store through an interactive and responsive web interface.

---

## 📌 Features

### 👤 User Module
- User Registration & Login
- Secure Authentication
- Session Management
- User Profile Management

### 🛍️ Product Module
- View Organic Skincare Products
- Product Details
- Product Categories
- Responsive Product Listing

### 🛒 Shopping Cart
- Add Products to Cart
- Update Product Quantity
- Remove Products
- View Cart Total

### 📦 Order Management
- Place Orders
- View Order History
- Track Purchased Products

### 📞 Contact Module
- Contact Form
- Store Customer Queries in MySQL
- Form Validation

### 🎨 User Interface
- Fully Responsive Design
- Modern UI
- Smooth Navigation
- Mobile Friendly

---

# 🏗️ Project Structure

```
ecommerce-project-main/
│
├── app.py                  # Main Flask Application
├── config.py               # Configuration Settings
├── db.py                   # Database Connection
│
├── static/
│   ├── css/
│   │   ├── style.css
│   │   └── blog-platform.css
│   │
│   └── js/
│       ├── script.js
│       └── blog-platform.js
│
├── templates/
│   ├── landing.html
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── products.html
│   ├── cart.html
│   ├── orders.html
│   ├── contact.html
│   └── blog.html
│
└── README.md
```

---

# 💻 Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- Flask

### Database
- MySQL

### Tools
- VS Code
- Git
- GitHub
- MySQL Workbench
- XAMPP (Optional)

---

# 🗄️ Database

The project uses **MySQL** as the backend database.

Main tables include:

- Users
- Products
- Cart
- Orders
- Order Items
- Contact Submissions

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/yourusername/glownature.git
```

Move into the project folder

```bash
cd glownature
```

Install Dependencies

```bash
pip install flask
pip install mysql-connector-python
```

---

# 🛠 Configure Database

Update the database credentials in `config.py`.

```python
MYSQL_HOST = "127.0.0.1"
MYSQL_USER = "root"
MYSQL_PASSWORD = ""
MYSQL_DB = "glownature_db"
```

Import the SQL database into MySQL.

---

# ▶️ Run the Application

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000
```

---

# 📸 Screens

- Landing Page
- Home Page
- Login
- Signup
- Products
- Shopping Cart
- Orders
- Contact Us
- Blog

---

# 🚀 Future Enhancements

- Online Payment Gateway
- Admin Dashboard
- Product Search & Filters
- Wishlist
- Product Reviews & Ratings
- Email Notifications
- Order Tracking
- Inventory Management
- AI Product Recommendation
- Coupon & Discount System

---

# 🎯 Learning Outcomes

This project demonstrates:

- Flask Web Development
- MySQL Database Integration
- REST API Basics
- User Authentication
- CRUD Operations
- Session Management
- Responsive UI Development
- Database Connectivity
- Full-Stack Web Development

---

# 👨‍💻 Author

**Nidhish Kumar P**

B.Tech Artificial Intelligence and Data Science

Janson's Institute of Technology

---

# 📬 Connect With Me

**GitHub**
https://github.com/NIDHISHKUMAR245

**LinkedIn**
https://www.linkedin.com/in/nidhish-kumar-4a9802334/

---

# 📄 License

This project is developed for educational and learning purposes.
