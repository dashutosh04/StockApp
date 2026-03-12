import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
    UPSTASH_REDIS_URL   = os.getenv("UPSTASH_REDIS_URL", "")
    UPSTASH_REDIS_TOKEN = os.getenv("UPSTASH_REDIS_TOKEN", "")
    MODEL_DIR       = os.path.join(
                        os.path.dirname(__file__),
                        "model", "saved"
                      )
    TRAINING_PERIOD = "2y"
    MIN_ROWS_NEEDED = 100
    MODEL_STALE_DAYS = 7 
    STOCK_BASKET = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "META",
        "NVDA", "TSLA", "AMD",   "INTC", "CRM",
        "JPM",  "BAC",  "GS",    "MS",   "V",
        "JNJ",  "PFE",  "UNH",   "ABBV",
        "DIS",  "NFLX", "UBER",  "WMT",  "PYPL"
    ]
    INDICES = {
        "S&P 500"  : "^GSPC",
        "NASDAQ"   : "^IXIC",
        "Dow Jones": "^DJI",
        "VIX"      : "^VIX"
    }