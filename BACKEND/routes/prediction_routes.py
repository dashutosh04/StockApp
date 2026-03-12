from flask import Blueprint, request, jsonify

from model.predict import get_prediction
from model.train import train_model, delete_model
from services.finnhub_service import get_company_news
from services.sentiment_service import (
    analyze_news_list,
    get_recommendation,
    adjust_confidence     
)
from utils.cache import get_cached, set_cache, clear_cache
from utils.helpers import success_response, error_response

prediction_bp = Blueprint('prediction', __name__)


@prediction_bp.route('/', methods=['GET'])
def predict():
    symbol = request.args.get('symbol', '').upper().strip()

    if not symbol:
        return jsonify(*error_response(
            "Symbol is required", 400
        ))

    cache_key = f"prediction_{symbol}"
    cached    = get_cached(cache_key)
    if cached:
        print(f"[Route] Returning cached prediction for {symbol}")
        return jsonify(*success_response(cached))

    try:
        print(f"\n[Route] Starting full prediction for {symbol}")
        prediction = get_prediction(symbol)

        base_confidence = prediction['confidence']
        trend           = prediction['trend']
        print(f"[Route] Fetching news for {symbol}...")
        try:
            news_list = get_company_news(symbol, days=3)
        except Exception as e:
            print(f"[Route] News fetch failed: {e}")
            news_list = []
        print(f"[Route] Analyzing sentiment...")
        sentiment = analyze_news_list(news_list)

        sentiment_label = sentiment['overall_label']
        sentiment_score = sentiment['overall_score']

        print(f"[Route] Sentiment: {sentiment_label} "
              f"(score: {sentiment_score})")

        adjusted_confidence = adjust_confidence(
            base_confidence = base_confidence,
            trend           = trend,
            sentiment_label = sentiment_label,
            sentiment_score = sentiment_score
        )

        print(f"[Route] Confidence: {base_confidence}% "
              f"→ {adjusted_confidence}% "
              f"(after sentiment adjustment)")

        recommendation = get_recommendation(
            trend           = trend,
            sentiment_label = sentiment_label
        )

        print(f"[Route] Recommendation: "
              f"{recommendation['action']}")

        result = {
            "symbol"          : prediction['symbol'],
            "current_price"   : prediction['current_price'],
            "predicted_price" : prediction['predicted_price'],
            "price_change"    : prediction['price_change'],
            "price_change_pct": prediction['price_change_pct'],
            "trend"           : trend,
            "risk"            : prediction['risk'],

            "base_confidence" : base_confidence,
            "confidence"      : adjusted_confidence,

            "feature_importance": prediction['feature_importance'],

            "model_info"      : prediction['model_info'],

            "sentiment": {
                "overall_score" : sentiment_score,
                "overall_label" : sentiment_label,
                "positive_count": sentiment['positive_count'],
                "negative_count": sentiment['negative_count'],
                "neutral_count" : sentiment['neutral_count'],
                "article_count" : len(sentiment['articles']),
                "articles"      : sentiment['articles'][:5],
            },
            "recommendation": recommendation,
        }
        set_cache(cache_key, result, timeout=300)

        print(f"[Route] Prediction complete for {symbol}\n")
        return jsonify(*success_response(result))

    except Exception as e:
        print(f"[Route] Prediction failed for {symbol}: {e}")
        return jsonify(*error_response(str(e), 500))


@prediction_bp.route('/retrain', methods=['POST'])
def retrain():
    data   = request.get_json()
    symbol = data.get('symbol', '').upper().strip() \
             if data else ''

    if not symbol:
        return jsonify(*error_response(
            "Symbol is required", 400
        ))

    try:
        delete_model(symbol)
        clear_cache(f"prediction_{symbol}")
        metrics = train_model(symbol)

        return jsonify(*success_response({
            "message": f"Model retrained successfully for {symbol}",
            "metrics": metrics
        }))

    except Exception as e:
        return jsonify(*error_response(str(e), 500))