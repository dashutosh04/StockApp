import yfinance as yf
import pandas as pd
from config import Config


def get_historical_data(symbol: str, period: str = '1mo') -> list:
    try:
        ticker = yf.Ticker(symbol)
        df     = ticker.history(period=period)

        if df.empty:
            raise ValueError(
                f"No historical data found for {symbol}"
            )

        result = []
        for index, row in df.iterrows():
            result.append({
                "date"  : str(index.date()),
                "open"  : round(float(row['Open']),   2),
                "high"  : round(float(row['High']),   2),
                "low"   : round(float(row['Low']),    2),
                "close" : round(float(row['Close']),  2),
                "volume": int(row['Volume']),
            })

        return result

    except Exception as e:
        raise Exception(
            f"yfinance history error for {symbol}: {str(e)}"
        )


def get_stock_info(symbol: str) -> dict:
    try:
        ticker = yf.Ticker(symbol)
        info   = ticker.info

        return {
            "name"              : info.get('longName', symbol),
            "sector"            : info.get('sector', 'N/A'),
            "industry"          : info.get('industry', 'N/A'),
            "market_cap"        : info.get('marketCap', 0),
            "pe_ratio"          : info.get('trailingPE', None),
            "eps"               : info.get('trailingEps', None),
            "week_52_high"      : info.get('fiftyTwoWeekHigh', None),
            "week_52_low"       : info.get('fiftyTwoWeekLow', None),
            "avg_volume"        : info.get('averageVolume', None),
            "beta"              : info.get('beta', None),
            "dividend_yield"    : info.get('dividendYield', None),
            "description"       : info.get('longBusinessSummary', ''),
        }

    except Exception as e:
        raise Exception(
            f"yfinance info error for {symbol}: {str(e)}"
        )


def get_multiple_quotes(symbols: list) -> list:
    try:
        tickers = yf.Tickers(' '.join(symbols))
        result  = []

        for symbol in symbols:
            try:
                ticker    = tickers.tickers[symbol]
                fast_info = ticker.fast_info

                price      = round(float(fast_info.last_price), 2)
                prev_close = round(float(fast_info.previous_close), 2)
                change     = round(price - prev_close, 2)
                change_pct = round(
                    ((price - prev_close) / prev_close) * 100, 2
                )
                volume     = int(
                    fast_info.three_month_average_volume or 0
                )

                result.append({
                    "symbol"    : symbol,
                    "price"     : price,
                    "change"    : change,
                    "change_pct": change_pct,
                    "volume"    : volume,
                })

            except Exception:
                continue

        return result

    except Exception as e:
        raise Exception(f"yfinance multi-quote error: {str(e)}")


def get_indices() -> list:
    try:
        result = []

        for name, symbol in Config.INDICES.items():
            try:
                ticker    = yf.Ticker(symbol)
                fast_info = ticker.fast_info

                price      = round(float(fast_info.last_price), 2)
                prev_close = round(float(fast_info.previous_close), 2)
                change_pct = round(
                    ((price - prev_close) / prev_close) * 100, 2
                )

                result.append({
                    "name"      : name,
                    "symbol"    : symbol,
                    "price"     : price,
                    "change_pct": change_pct,
                    "trend"     : "up" if change_pct > 0 else "down",
                })

            except Exception:
                continue

        return result

    except Exception as e:
        raise Exception(f"yfinance indices error: {str(e)}")