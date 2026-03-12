from flask import Blueprint, request, jsonify
from services.finnhub_service import get_company_news
from services.sentiment_service import analyze_news_list
from utils.cache import get_cached, set_cache
from utils.helpers import success_response, error_response

news_bp = Blueprint('news', __name__)

@news_bp.route('/', methods=['GET'])
def news():
    symbol = request.args.get('symbol', '').upper().strip()
    days   = int(request.args.get('days', 7))

    if not symbol:
        return jsonify(*error_response("Symbol is required", 400))

    cache_key = f"news_{symbol}_{days}"
    cached    = get_cached(cache_key)
    if cached:
        return jsonify(*success_response(cached))

    try:
        articles = get_company_news(symbol, days=days)
        sentiment_data = analyze_news_list(articles)

        result = {
            "symbol"  : symbol,
            "count"   : len(sentiment_data['articles']),
            **sentiment_data
        }
        set_cache(cache_key, result, timeout=900)
        return jsonify(*success_response(result))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))