from flask import Blueprint, request, jsonify
from services.finnhub_service import (
    get_quote,
    get_company_profile,
    search_symbol
)
from services.yfinance_service import (
    get_historical_data,
    get_stock_info
)
from utils.cache import get_cached, set_cache
from utils.helpers import (
    success_response,
    error_response,
    format_market_cap,
    format_volume
)

stock_bp = Blueprint('stock', __name__)


@stock_bp.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '').strip()

    if not query or len(query) < 1:
        return jsonify(*error_response("Query is required", 400))

    cache_key = f"search_{query}"
    cached    = get_cached(cache_key)
    if cached:
        return jsonify(*success_response(cached))

    try:
        results = search_symbol(query)
        set_cache(cache_key, results, timeout=300)
        return jsonify(*success_response(results))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))


@stock_bp.route('/quote', methods=['GET'])
def quote():
    symbol = request.args.get('symbol', '').upper().strip()

    if not symbol:
        return jsonify(*error_response("Symbol is required", 400))

    cache_key = f"quote_{symbol}"
    cached    = get_cached(cache_key)
    if cached:
        return jsonify(*success_response(cached))

    try:
        data = get_quote(symbol)
        set_cache(cache_key, data, timeout=30)  
        return jsonify(*success_response(data))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))

@stock_bp.route('/history', methods=['GET'])
def history():
    symbol = request.args.get('symbol', '').upper().strip()
    period = request.args.get('period', '1mo')

    valid_periods = ['1wk', '1mo', '3mo', '6mo', '1y', '2y']

    if not symbol:
        return jsonify(*error_response("Symbol is required", 400))

    if period not in valid_periods:
        return jsonify(*error_response(
            f"Invalid period. Choose from: {valid_periods}", 400
        ))

    cache_key = f"history_{symbol}_{period}"
    cached    = get_cached(cache_key)
    if cached:
        return jsonify(*success_response(cached))

    try:
        data = get_historical_data(symbol, period)
        set_cache(cache_key, data, timeout=300)
        return jsonify(*success_response(data))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))

@stock_bp.route('/info', methods=['GET'])
def info():
    symbol = request.args.get('symbol', '').upper().strip()

    if not symbol:
        return jsonify(*error_response("Symbol is required", 400))

    cache_key = f"info_{symbol}"
    cached    = get_cached(cache_key)
    if cached:
        return jsonify(*success_response(cached))

    try:
        yf_info  = get_stock_info(symbol)
        profile  = get_company_profile(symbol)

        combined = {
            **yf_info,
            "logo"          : profile.get('logo', ''),
            "website"       : profile.get('website', ''),
            "exchange"      : profile.get('exchange', ''),
            "market_cap_fmt": format_market_cap(
                                yf_info.get('market_cap', 0)
                              ),
            "avg_volume_fmt": format_volume(
                                yf_info.get('avg_volume', 0)
                              ),
        }

        set_cache(cache_key, combined, timeout=3600)
        return jsonify(*success_response(combined))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))