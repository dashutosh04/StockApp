from flask import Blueprint, jsonify
from services.yfinance_service import (
    get_multiple_quotes,
    get_indices
)
from services.finnhub_service import get_market_status
from utils.cache import get_cached, set_cache
from utils.helpers import success_response, error_response, format_volume
from config import Config

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/trending', methods=['GET'])
def trending():
    cache_key = "dashboard_trending"
    cached    = get_cached(cache_key)
    if cached:
        return jsonify(*success_response(cached))

    try:
        quotes = get_multiple_quotes(Config.STOCK_BASKET)
        sorted_quotes = sorted(
            quotes,
            key=lambda x: x['change_pct'],
            reverse=True
        )

        gainers = sorted_quotes[:5]
        losers  = sorted_quotes[-5:][::-1]

        result = {
            "gainers": gainers,
            "losers" : losers,
        }

        set_cache(cache_key, result, timeout=60)
        return jsonify(*success_response(result))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))

@dashboard_bp.route('/indices', methods=['GET'])
def indices():
    cache_key = "dashboard_indices"
    cached    = get_cached(cache_key)
    if cached:
        return jsonify(*success_response(cached))

    try:
        data = get_indices()
        set_cache(cache_key, data, timeout=60)
        return jsonify(*success_response(data))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))

@dashboard_bp.route('/market-overview', methods=['GET'])
def market_overview():
    cache_key = "dashboard_overview"
    cached    = get_cached(cache_key)
    if cached:
        return jsonify(*success_response(cached))

    try:
        status = get_market_status()
        quotes = get_multiple_quotes(Config.STOCK_BASKET)

        if not quotes:
            raise ValueError("Could not fetch market data")

        total   = len(quotes)
        up      = sum(1 for q in quotes if q['change_pct'] > 0)
        down    = sum(1 for q in quotes if q['change_pct'] < 0)
        flat    = total - up - down

        total_volume = sum(q['volume'] for q in quotes)

        result = {
            "market_status" : status,
            "total_stocks"  : total,
            "stocks_up"     : up,
            "stocks_down"   : down,
            "stocks_flat"   : flat,
            "pct_up"        : round((up / total) * 100, 1),
            "pct_down"      : round((down / total) * 100, 1),
            "total_volume"  : total_volume,
            "total_volume_fmt": format_volume(total_volume),
        }
        set_cache(cache_key, result, timeout=60)
        return jsonify(*success_response(result))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))

@dashboard_bp.route('/watchlist', methods=['GET'])
def watchlist():
    from flask import request
    symbols_param = request.args.get('symbols', '')

    if not symbols_param:
        return jsonify(*error_response("Symbols are required", 400))

    symbols = [s.strip().upper() for s in symbols_param.split(',')]

    if len(symbols) > 10:
        return jsonify(*error_response(
            "Maximum 10 symbols allowed", 400
        ))

    try:
        quotes = get_multiple_quotes(symbols)
        return jsonify(*success_response(quotes))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))