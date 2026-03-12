from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from flask_bcrypt import Bcrypt
from database import get_db_connection, get_db_cursor
from utils.helpers import success_response, error_response
import re

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    data = request.get_json()
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not name or len(name) < 2:
        return jsonify(*error_response("Name must be at least 2 characters", 400))
    
    if not email or not EMAIL_REGEX.match(email):
        return jsonify(*error_response("Invalid email address", 400))
    
    if not password or len(password) < 6:
        return jsonify(*error_response("Password must be at least 6 characters", 400))
    
    try:
        with get_db_connection() as conn:
            cursor = get_db_cursor(conn)
            
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify(*error_response("Email already registered", 400))
            
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            
            cursor.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
                (name, email, password_hash)
            )
            user_id = cursor.lastrowid
            
            access_token = create_access_token(
                identity=user_id,
                additional_claims={'email': email, 'name': name}
            )
            refresh_token = create_refresh_token(identity=user_id)
            
            return jsonify(*success_response({
                'user': {'id': user_id, 'name': name, 'email': email},
                'access_token': access_token,
                'refresh_token': refresh_token
            }))
            
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify(*error_response(str(e), 500))


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify(*error_response("Email and password are required", 400))
    
    try:
        with get_db_connection() as conn:
            cursor = get_db_cursor(conn)
            
            cursor.execute(
                "SELECT id, name, email, password_hash FROM users WHERE email = %s",
                (email,)
            )
            user = cursor.fetchone()
            
            if not user or not bcrypt.check_password_hash(user['password_hash'], password):
                return jsonify(*error_response("Invalid email or password", 401))
            
            access_token = create_access_token(
                identity=user['id'],
                additional_claims={'email': user['email'], 'name': user['name']}
            )
            refresh_token = create_refresh_token(identity=user['id'])
            
            return jsonify(*success_response({
                'user': {'id': user['id'], 'name': user['name'], 'email': user['email']},
                'access_token': access_token,
                'refresh_token': refresh_token
            }))
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify(*error_response(str(e), 500))


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    user_id = get_jwt_identity()
    
    try:
        with get_db_connection() as conn:
            cursor = get_db_cursor(conn)
            cursor.execute(
                "SELECT id, name, email, created_at FROM users WHERE id = %s",
                (user_id,)
            )
            user = cursor.fetchone()
            
            if not user:
                return jsonify(*error_response("User not found", 404))
            
            return jsonify(*success_response(user))
            
    except Exception as e:
        return jsonify(*error_response(str(e), 500))


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user"""
    return jsonify(*success_response({'message': 'Logged out successfully'}))