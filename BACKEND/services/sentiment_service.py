from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
analyzer= SentimentIntensityAnalyzer()


def analyze_headline(headline: str) -> dict:
    scores   = analyzer.polarity_scores(headline)
    compound = round(scores['compound'], 4)

    if compound >= 0.05:
        label = "Positive"
        color = "green"
    elif compound <= -0.05:
        label = "Negative"
        color = "red"
    else:
        label = "Neutral"
        color = "gray"

    return {
        "headline": headline,
        "compound": compound,
        "label"   : label,
        "color"   : color,
        "positive": round(scores['pos'], 4),
        "negative": round(scores['neg'], 4),
        "neutral" : round(scores['neu'], 4),
    }


def analyze_news_list(news_list: list) -> dict:
    if not news_list:
        return {
            "articles"      : [],
            "overall_score" : 0.0,
            "overall_label" : "Neutral",
            "positive_count": 0,
            "negative_count": 0,
            "neutral_count" : 0,
        }

    analyzed    = []
    total_score = 0.0

    for article in news_list:
        headline  = article.get('headline', '')
        sentiment = analyze_headline(headline)

        analyzed.append({
            **article,
            "sentiment_label": sentiment['label'],
            "sentiment_score": sentiment['compound'],
            "sentiment_color": sentiment['color'],
        })

        total_score += sentiment['compound']
    avg_score = round(total_score / len(news_list), 4)

    if avg_score >= 0.05:
        overall_label = "Positive"
    elif avg_score <= -0.05:
        overall_label = "Negative"
    else:
        overall_label = "Neutral"

    positive_count = sum(
        1 for a in analyzed
        if a['sentiment_label'] == 'Positive'
    )
    negative_count = sum(
        1 for a in analyzed
        if a['sentiment_label'] == 'Negative'
    )
    neutral_count = sum(
        1 for a in analyzed
        if a['sentiment_label'] == 'Neutral'
    )

    return {
        "articles"      : analyzed,
        "overall_score" : avg_score,
        "overall_label" : overall_label,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "neutral_count" : neutral_count,
    }


def get_recommendation(trend: str, sentiment_label: str) -> dict:
    matrix = {
        ("Bullish", "Positive"): {
            "action"     : "STRONG BUY",
            "color"      : "green",
            "description": "AI predicts upward movement with "
                           "positive market sentiment",
        },
        ("Bullish", "Neutral"): {
            "action"     : "BUY",
            "color"      : "green",
            "description": "AI predicts upward movement with "
                           "neutral market sentiment",
        },
        ("Bullish", "Negative"): {
            "action"     : "WEAK BUY",
            "color"      : "yellow",
            "description": "AI predicts upward movement but "
                           "negative sentiment adds risk",
        },
        ("Bearish", "Positive"): {
            "action"     : "HOLD",
            "color"      : "yellow",
            "description": "AI predicts downward movement but "
                           "positive sentiment may support price",
        },
        ("Bearish", "Neutral"): {
            "action"     : "WEAK SELL",
            "color"      : "red",
            "description": "AI predicts downward movement with "
                           "neutral market sentiment",
        },
        ("Bearish", "Negative"): {
            "action"     : "STRONG SELL",
            "color"      : "red",
            "description": "AI predicts downward movement "
                           "confirmed by negative sentiment",
        },
    }

    key    = (trend, sentiment_label)
    result = matrix.get(key, {
        "action"     : "HOLD",
        "color"      : "yellow",
        "description": "Insufficient data to make recommendation",
    })

    return result


def adjust_confidence(
    base_confidence : float,
    trend           : str,
    sentiment_label : str,
    sentiment_score : float
) -> float:
    adjustment = 0.0
    if trend == "Bullish" and sentiment_label == "Positive":
        adjustment = 5.0 + (sentiment_score * 5)
    elif trend == "Bearish" and sentiment_label == "Negative":
        adjustment = 5.0 + (abs(sentiment_score) * 5)
    elif trend == "Bullish" and sentiment_label == "Negative":
        adjustment = -8.0 - (abs(sentiment_score) * 4)
    elif trend == "Bearish" and sentiment_label == "Positive":
        adjustment = -8.0 - (sentiment_score * 4)
    else:
        adjustment = 0.0
    adjusted = base_confidence + adjustment
    adjusted = round(float(max(40, min(99, adjusted))), 1)

    return adjusted