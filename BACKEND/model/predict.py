import os
import joblib
import numpy as np
import yfinance as yf

from model.features import calculate_features, FEATURE_COLUMNS
from model.train import (
    train_model,
    is_model_trained,
    is_model_stale,
    get_model_age_days,
    get_model_meta,
    _get_feature_importance
)
from config import Config


def get_prediction(symbol: str) -> dict:
    training_metrics = None

    if not is_model_trained(symbol):
        print(f"\n[Predict] No model found for {symbol}")
        print(f"[Predict] Starting fresh training...")
        training_metrics = train_model(symbol)

    elif is_model_stale(symbol):
        age = get_model_age_days(symbol)
        print(f"\n[Predict] Model for {symbol} is {age} days old")
        print(f"[Predict] Stale threshold: "
              f"{Config.MODEL_STALE_DAYS} days")
        print(f"[Predict] Retraining with fresh market data...")
        training_metrics = train_model(symbol)
    else:
        age  = get_model_age_days(symbol)
        meta = get_model_meta(symbol)
        print(f"\n[Predict] Fresh model found for {symbol}")
        print(f"[Predict] Trained: {meta.get('trained_at')}")
        print(f"[Predict] Age: {age} day(s) — loading directly")

    model, scaler = _load_model(symbol)
    print(f"[Predict] Fetching latest market data for {symbol}...")

    ticker = yf.Ticker(symbol)
    df     = ticker.history(period="3mo")

    if df is None or df.empty:
        raise ValueError(
            f"Could not fetch recent market data for {symbol}. "
            f"Check if market is open or symbol is valid."
        )

    df = calculate_features(df)

    if df.empty:
        raise ValueError(
            f"Feature calculation failed for {symbol}. "
            f"Not enough data points."
        )
    latest_features = df[FEATURE_COLUMNS].iloc[-1].values
    current_price   = float(df['Close'].iloc[-1])

    print(f"[Predict] Current price   : ${current_price:.2f}")

    features_scaled = scaler.transform([latest_features])
    predicted_price = float(model.predict(features_scaled)[0])

    print(f"[Predict] Predicted price : ${predicted_price:.2f}")
    price_change     = predicted_price - current_price
    price_change_pct = (price_change / current_price) * 100
    trend = "Bullish" if price_change > 0 else "Bearish"
    risk = _calculate_risk(abs(price_change_pct))
    if training_metrics:
        confidence = training_metrics['confidence']
    else:
        meta       = get_model_meta(symbol)
        confidence = meta.get('confidence', 75.0)
    feature_importance = _get_feature_importance(model)

    meta     = get_model_meta(symbol)
    age_days = get_model_age_days(symbol)

    print(f"[Predict] Trend           : {trend}")
    print(f"[Predict] Confidence      : {confidence}%")
    print(f"[Predict] Risk            : {risk}")
    print(f"[Predict] Model age       : {age_days} day(s)\n")

    return {
        "symbol"           : symbol,
        "current_price"    : round(current_price, 2),
        "predicted_price"  : round(predicted_price, 2),
        "price_change"     : round(price_change, 2),
        "price_change_pct" : round(price_change_pct, 2),
        "trend"            : trend,
        "confidence"       : confidence,
        "risk"             : risk,
        "feature_importance": feature_importance,
        "model_info"       : {
            "trained_at"  : meta.get('trained_at', 'unknown'),
            "age_days"    : age_days,
            "mape"        : meta.get('mape', None),
            "mae"         : meta.get('mae', None),
            "rmse"        : meta.get('rmse', None),
            "rows_trained": meta.get('rows_trained', None),
            "train_size"  : meta.get('train_size', None),
            "test_size"   : meta.get('test_size', None),
        }
    }


def _load_model(symbol: str):
    model_path  = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_model.pkl"
                  )
    scaler_path = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_scaler.pkl"
                  )

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file not found: {model_path}"
        )

    if not os.path.exists(scaler_path):
        raise FileNotFoundError(
            f"Scaler file not found: {scaler_path}"
        )

    model  = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    return model, scaler


def _calculate_risk(change_pct: float) -> str:
    if change_pct < 1.0:
        return "Low"
    elif change_pct < 2.5:
        return "Medium"
    else:
        return "High"