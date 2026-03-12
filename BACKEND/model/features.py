import pandas as pd
import numpy as np
import ta

FEATURE_COLUMNS = [
    'MA5', 'MA10', 'MA20',
    'RSI',
    'MACD', 'MACD_Signal', 'MACD_Hist',
    'BB_Upper', 'BB_Lower', 'BB_Width',
    'ATR',
    'Volume_Change',
    'Price_Change',
    'High_Low_Pct',
    'Day_of_Week',
    'Month'
]


def calculate_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df['MA5']  = ta.trend.sma_indicator(
                    df['Close'], window=5
                 )
    df['MA10'] = ta.trend.sma_indicator(
                    df['Close'], window=10
                 )
    df['MA20'] = ta.trend.sma_indicator(
                    df['Close'], window=20
                 )

    df['RSI']  = ta.momentum.rsi(
                    df['Close'], window=14
                 )
    macd              = ta.trend.MACD(df['Close'])
    df['MACD']        = macd.macd()
    df['MACD_Signal'] = macd.macd_signal()
    df['MACD_Hist']   = macd.macd_diff()

    bb = ta.volatility.BollingerBands(
                        df['Close'], window=20
                     )
    df['BB_Upper'] = bb.bollinger_hband()
    df['BB_Lower'] = bb.bollinger_lband()
    df['BB_Width'] = df['BB_Upper'] - df['BB_Lower']

    df['ATR'] = ta.volatility.average_true_range(
                    df['High'],
                    df['Low'],
                    df['Close'],
                    window=14
                )

    df['Volume_Change'] = df['Volume'].pct_change() * 100
    df['Price_Change'] = df['Close'].pct_change() * 100

    df['High_Low_Pct'] = (
                            (df['High'] - df['Low'])
                            / df['Close']
                          ) * 100

    df['Day_of_Week'] = df.index.dayofweek   
    df['Month']       = df.index.month       
    df['Target'] = df['Close'].shift(-1)
    df.dropna(inplace=True)

    return df