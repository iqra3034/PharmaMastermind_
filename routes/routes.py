
from flask import Blueprint, render_template, send_from_directory, session, redirect, url_for

routes = Blueprint('routes', __name__)


@routes.route('/signup')
def signup():
    return render_template('SignUp.html')

@routes.route('/signin')
def signin():
    return render_template('SignIn.html')

@routes.route('/forgot_password')
def forgot_password():
    return render_template('ForgetPassword.html')

@routes.route('/verification')
def verification():
    return render_template('verification.html')

@routes.route('/reset-password')
def reset_password_page():
    return render_template('reset-password.html')

@routes.route('/dashboard')
def dashboard():
    role = session.get("role")
    if role in ["admin", "owner"]:
        return render_template("ownerdashboard.html")
    elif role == "employee":
        return redirect(url_for('routes.point_of_sale'))
    elif role == ["customer", "owner","admin"]:
        return redirect(url_for('routes.customer'))
    return "Unauthorized access", 403

@routes.route('/BIexpiry')
def BIexpiry():
    role = session.get("role")
    if role in ["admin", "owner"]:
        return render_template("BIexpiry.html")
    return "Unauthorized access", 403

@routes.route('/customerdashboard')
def customerdashboard():
    role = session.get("role")
    if role in ["admin", "owner"]:
        return render_template("customerdashboard.html")
    return "Unauthorized access", 403


@routes.route('/admininventory')
def inventory():
    if session.get("role") != "admin":
        return "Unauthorized access", 403
    return render_template("admininventory.html")

@routes.route('/employes')
def employes():
    if session.get("role") != "admin":
        return "Unauthorized access", 403
    return render_template("employee.html")

@routes.route('/expiry')
def expiry():
    if session.get("role") != "admin":
        return "Unauthorized access", 403
    return render_template("expiriy.html")

@routes.route('/order')
def order():
    if session.get("role") != "admin":
        return "Unauthorized access", 403
    return render_template("order.html")

@routes.route('/customer')
def customer():
    if session.get("role") not in ["customer", "owner", "admin"]:
        return "Unauthorized access", 403
    return render_template("customer.html")

@routes.route('/customerprofile')
def customer_profile():
    if session.get("role") != "customer":
        return "Unauthorized access", 403
    return render_template("customerprofile.html")


@routes.route('/adminusers')
def admin_users():
    role = session.get("role")
    if role not in ["owner", "admin"]:
        return "Unauthorized access", 403
    return render_template("adminusers.html")


@routes.route('/pos')
def point_of_sale():
    if session.get("role") not in ["employee", "admin"]:
        return "Unauthorized access", 403
    return send_from_directory('pos', 'pos.html')

@routes.route('/inventory')
def pos_inventory():
    if session.get("role") not in ["employee", "admin"]:
        return "Unauthorized access", 403
    return send_from_directory('pos', 'inventory.html')

@routes.route('/invoice')
def pos_invoice():
    if session.get("role") not in ["employee", "admin"]:
        return "Unauthorized access", 403
    return send_from_directory('pos', 'invoice.html')

@routes.route('/returns')
def pos_returns():
    if session.get("role") not in ["employee", "admin"]:
        return "Unauthorized access", 403
    return send_from_directory('pos', 'returns.html')

@routes.route('/logout')
def logout():
    session.clear()   
    return redirect('/')  


@routes.route('/payment')
def payment():
    if session.get("role") not in [ "admin", "customer","owner"]:
        return "Unauthorized access", 403
    return send_from_directory('payment', 'index.html')


@routes.route('/css/<path:filename>')
def send_css(filename):
    return send_from_directory('css', filename)

@routes.route('/js/<path:filename>')
def send_js(filename):
    return send_from_directory('js', filename)

@routes.route('/pictures/<path:filename>')
def send_pictures(filename):
    return send_from_directory('pictures', filename)

@routes.route('/<filename>.js')
def serve_js_file(filename):
    return send_from_directory('pos', f'{filename}.js')

@routes.route('/<filename>.css')
def serve_css_file(filename):
    return send_from_directory('pos', f'{filename}.css')

@routes.route('/pictures/pos/<path:filename>')
def serve_images(filename):
    return send_from_directory('pos/Picture', filename)

@routes.route('/payment/<path:filename>.css')
def serve_payment_css(filename):
    return send_from_directory('payment', f'{filename}.css')

@routes.route('/payment/<path:filename>.js')
def serve_payment_js(filename):
    return send_from_directory('payment', f'{filename}.js')
@routes.route('/customer-pattern')
def customer_pattern():
    return render_template('customerpurchase.html')

@routes.route('/seasonal-demand')
def seasonal_demand(): 
    return render_template('forecast.html')


@routes.route('/restocking')
def restocking(): 
    return render_template('Restock Prediction.html')

@routes.route('/smart-recommendation')
def smart_recommendation(): 
    return render_template('SmartRecommendation.html')

@routes.route('/owner-approvals')
def owner_approvals():
    role = session.get("role")
    if role != "owner":
        return "Unauthorized access", 403
    return render_template('owner-approvals.html')


@routes.route('/admin-approvals')
def admin_approvals():
    role = session.get("role")
    if role != "admin":
        return "Unauthorized access", 403
    return render_template('admin-approvals.html')

@routes.route('/profit-margin')
def profit_margin():
    role = session.get("role")
    if role not in ["owner", "admin"]:
        return "Unauthorized access", 403
    return render_template('ownerdashboard.html')