import os
import json
import joblib
import numpy as np
import pandas as pd
import yfinance as yf

from datetime import datetime
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error
)

from model.features import calculate_features, FEATURE_COLUMNS
from config import Config


def train_model(symbol: str) -> dict:

    print(f"\n{'='*50}")
    print(f" Training model for {symbol}")
    print(f"{'='*50}")
    print(f"Fetching {Config.TRAINING_PERIOD} "
          f"of historical data...")

    ticker = yf.Ticker(symbol)
    df     = ticker.history(period=Config.TRAINING_PERIOD)

    if df is None or df.empty:
        raise ValueError(
            f"No data returned for symbol '{symbol}'. "
            f"Check if the ticker is valid."
        )

    if len(df) < Config.MIN_ROWS_NEEDED:
        raise ValueError(
            f"Not enough data for {symbol}. "
            f"Got {len(df)} rows, "
            f"need at least {Config.MIN_ROWS_NEEDED}."
        )

    print(f"Fetched {len(df)} rows")
    print(f"Calculating technical indicators...")
    df = calculate_features(df)
    print(f"{len(df)} rows after cleaning")
    print(f"Preparing training data...")

    X = df[FEATURE_COLUMNS].values
    y = df['Target'].values
    scaler   = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y,
        test_size=0.2,
        shuffle=False
    )

    print(f"Train: {len(X_train)} rows | "
          f"Test: {len(X_test)} rows")

    print(f"Training XGBoost model...")

    model = XGBRegressor(
        n_estimators     = 200,
        learning_rate    = 0.05,
        max_depth        = 4,
        subsample        = 0.8,
        colsample_bytree = 0.8,
        random_state     = 42,
        verbosity        = 0
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )

    print(f"Training complete \n Evaluating on test set...")

    y_pred = model.predict(X_test)

    mae  = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    mape = float(
               np.mean(
                   np.abs((y_test - y_pred) / y_test)
               ) * 100
           )

    confidence = round(float(max(50, min(99, 100 - mape))), 1)

    print(f"      MAE        : {mae:.4f}")
    print(f"      RMSE       : {rmse:.4f}")
    print(f"      MAPE       : {mape:.2f}%")
    print(f"      Confidence : {confidence}%")

    os.makedirs(Config.MODEL_DIR, exist_ok=True)

    model_path  = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_model.pkl"
                  )
    scaler_path = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_scaler.pkl"
                  )
    meta_path   = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_meta.json"
                  )

    joblib.dump(model,  model_path)
    joblib.dump(scaler, scaler_path)

    print(f"\nModel  saved → {model_path}")
    print(f"Scaler saved → {scaler_path}")

    meta = {
        "symbol"      : symbol,
        "trained_at"  : datetime.utcnow().isoformat(),
        "rows_trained": int(len(df)),
        "train_size"  : int(len(X_train)),
        "test_size"   : int(len(X_test)),
        "mape"        : round(mape, 2),
        "mae"         : round(mae, 4),
        "rmse"        : round(rmse, 4),
        "confidence"  : confidence,
    }

    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)

    feature_importance = _get_feature_importance(model)

    print(f"\nTraining complete for {symbol}")
    print(f"{'='*50}\n")

    return {
        "symbol"            : symbol,
        "rows_trained"      : int(len(df)),
        "train_size"        : int(len(X_train)),
        "test_size"         : int(len(X_test)),
        "mae"               : round(mae, 4),
        "rmse"              : round(rmse, 4),
        "mape"              : round(mape, 2),
        "confidence"        : confidence,
        "trained_at"        : meta["trained_at"],
        "feature_importance": feature_importance
    }


def is_model_trained(symbol: str) -> bool:
    model_path  = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_model.pkl"
                  )
    scaler_path = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_scaler.pkl"
                  )
    meta_path   = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_meta.json"
                  )

    return (
        os.path.exists(model_path)  and
        os.path.exists(scaler_path) and
        os.path.exists(meta_path)
    )


def is_model_stale(symbol: str) -> bool:
    age = get_model_age_days(symbol)
    return age >= Config.MODEL_STALE_DAYS


def get_model_age_days(symbol: str) -> int:
    meta_path = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_meta.json"
                )

    if not os.path.exists(meta_path):
        return 999

    try:
        with open(meta_path, 'r') as f:
            meta = json.load(f)

        trained_at = datetime.fromisoformat(meta['trained_at'])
        age_days   = (datetime.utcnow() - trained_at).days
        return int(age_days)

    except Exception:
        return 999


def get_model_meta(symbol: str) -> dict:
    meta_path = os.path.join(
                    Config.MODEL_DIR, f"{symbol}_meta.json"
                )

    if not os.path.exists(meta_path):
        return {}

    try:
        with open(meta_path, 'r') as f:
            return json.load(f)
    except Exception:
        return {}


def delete_model(symbol: str):
    files = [
        f"{symbol}_model.pkl",
        f"{symbol}_scaler.pkl",
        f"{symbol}_meta.json",
    ]

    for filename in files:
        path = os.path.join(Config.MODEL_DIR, filename)
        if os.path.exists(path):
            os.remove(path)
            print(f"[Delete] Removed {path}")

    print(f"[Delete] All files removed for {symbol}")


def _get_feature_importance(model: XGBRegressor) -> dict:
    scores = model.feature_importances_

    importance = {
        feature: round(float(score) * 100, 2)
        for feature, score in zip(FEATURE_COLUMNS, scores)
    }

    importance = dict(
        sorted(
            importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
    )

    return importance