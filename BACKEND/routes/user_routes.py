from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db_connection, get_db_cursor
from utils.helpers import success_response, error_response
from services.yfinance_service import get_multiple_quotes

user_bp = Blueprint('user', __name__)

@user_bp.route('/watchlist', methods=['GET'])
@jwt_required()
def get_user_watchlist():
    """Get user's personal watchlist with live quotes"""
    user_id = get_jwt_identity()
    
    try:
        with get_db_connection() as conn:
            cursor = get_db_cursor(conn)
            
            # Get user's watchlist symbols
            cursor.execute(
                "SELECT symbol, added_at FROM user_watchlist WHERE user_id = %s ORDER BY added_at DESC",
                (user_id,)
            )
            watchlist = cursor.fetchall()
            symbols = [item['symbol'] for item in watchlist]
            
            # Get live quotes for these symbols
            quotes = []
            if symbols:
                try:
                    quotes = get_multiple_quotes(symbols)
                except Exception as e:
                    print(f"Error fetching quotes: {e}")
            
            return jsonify(*success_response({
                'symbols': symbols,
                'count': len(symbols),
                'quotes': quotes,
                'details': watchlist
            }))
            
    except Exception as e:
        print(f"Get watchlist error: {str(e)}")
        return jsonify(*error_response(str(e), 500))


@user_bp.route('/watchlist/add', methods=['POST'])
@jwt_required()
def add_to_user_watchlist():
    """Add symbol to user's watchlist"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    symbol = data.get('symbol', '').strip().upper()
    
    if not symbol:
        return jsonify(*error_response("Symbol is required", 400))
    
    try:
        with get_db_connection() as conn:
            cursor = get_db_cursor(conn)
            
            # Check if already exists
            cursor.execute(
                "SELECT id FROM user_watchlist WHERE user_id = %s AND symbol = %s",
                (user_id, symbol)
            )
            if cursor.fetchone():
                return jsonify(*error_response("Symbol already in watchlist", 400))
            
            # Add to watchlist
            cursor.execute(
                "INSERT INTO user_watchlist (user_id, symbol) VALUES (%s, %s)",
                (user_id, symbol)
            )
            
            return jsonify(*success_response({
                'message': f'{symbol} added to watchlist',
                'symbol': symbol
            }))
            
    except Exception as e:
        print(f"Add to watchlist error: {str(e)}")
        return jsonify(*error_response(str(e), 500))


@user_bp.route('/watchlist/remove', methods=['DELETE'])
@jwt_required()
def remove_from_user_watchlist():
    """Remove symbol from user's watchlist"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    symbol = data.get('symbol', '').strip().upper()
    
    if not symbol:
        return jsonify(*error_response("Symbol is required", 400))
    
    try:
        with get_db_connection() as conn:
            cursor = get_db_cursor(conn)
            
            cursor.execute(
                "DELETE FROM user_watchlist WHERE user_id = %s AND symbol = %s",
                (user_id, symbol)
            )
            
            if cursor.rowcount == 0:
                return jsonify(*error_response("Symbol not in watchlist", 404))
            
            return jsonify(*success_response({
                'message': f'{symbol} removed from watchlist',
                'symbol': symbol
            }))
            
    except Exception as e:
        print(f"Remove from watchlist error: {str(e)}")
        return jsonify(*error_response(str(e), 500))


@user_bp.route('/watchlist/toggle', methods=['POST'])
@jwt_required()
def toggle_watchlist():
    """Toggle symbol in user's watchlist (add if not exists, remove if exists)"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    symbol = data.get('symbol', '').strip().upper()
    
    if not symbol:
        return jsonify(*error_response("Symbol is required", 400))
    
    try:
        with get_db_connection() as conn:
            cursor = get_db_cursor(conn)
            
            # Check if exists
            cursor.execute(
                "SELECT id FROM user_watchlist WHERE user_id = %s AND symbol = %s",
                (user_id, symbol)
            )
            exists = cursor.fetchone()
            
            if exists:
                # Remove
                cursor.execute(
                    "DELETE FROM user_watchlist WHERE user_id = %s AND symbol = %s",
                    (user_id, symbol)
                )
                return jsonify(*success_response({
                    'action': 'removed',
                    'message': f'{symbol} removed from watchlist',
                    'symbol': symbol
                }))
            else:
                # Add
                cursor.execute(
                    "INSERT INTO user_watchlist (user_id, symbol) VALUES (%s, %s)",
                    (user_id, symbol)
                )
                return jsonify(*success_response({
                    'action': 'added',
                    'message': f'{symbol} added to watchlist',
                    'symbol': symbol
                }))
            
    except Exception as e:
        print(f"Toggle watchlist error: {str(e)}")
        return jsonify(*error_response(str(e), 500))