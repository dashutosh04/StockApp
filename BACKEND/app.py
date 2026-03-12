import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager 
from flask_bcrypt import Bcrypt            
from datetime import timedelta             

from config import Config
from routes.stock_routes import stock_bp
from routes.prediction_routes import prediction_bp
from routes.news_routes import news_bp
from routes.dashboard_routes import dashboard_bp
from routes.auth_routes import auth_bp           
from routes.user_routes import user_bp

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'stockai-super-secret-jwt-key-change-in-production-2024')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    
    origins = os.getenv('ORIGINS', "http://localhost:3000").split(',')
    # CORS
    CORS(app, 
         origins=origins,
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Initialize extensions
    jwt = JWTManager(app)
    bcrypt = Bcrypt(app)
    
    # Initialize database tables
    try:
        from database import init_database
        init_database()
        print("✓ Database initialized")
    except Exception as e:
        print(f"⚠ Database initialization warning: {e}")
    
    # Register blueprints
    app.register_blueprint(auth_bp,       url_prefix='/api/auth')
    app.register_blueprint(user_bp,  url_prefix='/api/user')
    app.register_blueprint(stock_bp,      url_prefix='/api/stock')
    app.register_blueprint(prediction_bp, url_prefix='/api/predict')
    app.register_blueprint(news_bp,       url_prefix='/api/news')
    app.register_blueprint(dashboard_bp,  url_prefix='/api/dashboard')

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            "status" : "ok",
            "message": "Stock AI API is running",
            "auth": "enabled"
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "success": False,
            "error"  : "Route not found"
        }), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({
            "success": False,
            "error"  : "Internal server error"
        }), 500


    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            "success": False,
            "error": "Missing or invalid token"
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({
            "success": False,
            "error": "Token has expired"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "success": False,
            "error": "Invalid token"
        }), 401

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    print(f"\n🚀 Stock AI Backend starting on port {port}")
    print(f"📊 Database: Connected")
    print(f"🔐 Auth: JWT enabled\n")
    
    app.run(
        debug = os.getenv('FLASK_ENV', 'development') == 'development',
        port  = port,
        host  = '0.0.0.0'
    )