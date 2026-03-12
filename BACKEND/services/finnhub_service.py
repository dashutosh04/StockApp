import finnhub
from config import Config
from datetime import datetime, timedelta
client = finnhub.Client(api_key=Config.FINNHUB_API_KEY)


def get_quote(symbol: str) -> dict:
    """
    Get real-time quote for a stock
    Returns price, change, high, low
    """
    try:
        quote = client.quote(symbol)

        if not quote or quote.get('c') == 0:
            raise ValueError(f"No quote data for {symbol}")

        return {
            "symbol"     : symbol,
            "price"      : round(quote['c'], 2),
            "change"     : round(quote['d'], 2), 
            "change_pct" : round(quote['dp'], 2),
            "high"       : round(quote['h'], 2),
            "low"        : round(quote['l'], 2),
            "prev_close" : round(quote['pc'], 2),
            "open"       : round(quote['o'], 2),
        }

    except Exception as e:
        raise Exception(f"Finnhub quote error for {symbol}: {str(e)}")


def get_company_profile(symbol: str) -> dict:
    """
    Get company name, logo, sector, exchange info
    """
    try:
        profile = client.company_profile2(symbol=symbol)

        if not profile:
            raise ValueError(f"No profile data for {symbol}")

        return {
            "name"         : profile.get('name', symbol),
            "ticker"       : profile.get('ticker', symbol),
            "logo"         : profile.get('logo', ''),
            "sector"       : profile.get('finnhubIndustry', 'N/A'),
            "exchange"     : profile.get('exchange', 'N/A'),
            "market_cap"   : profile.get('marketCapitalization', 0),
            "ipo"          : profile.get('ipo', 'N/A'),
            "website"      : profile.get('weburl', ''),
            "country"      : profile.get('country', 'US'),
            "currency"     : profile.get('currency', 'USD'),
        }

    except Exception as e:
        raise Exception(
            f"Finnhub profile error for {symbol}: {str(e)}"
        )


def get_company_news(symbol: str, days: int = 7) -> list:
    try:
        today     = datetime.today()
        from_date = (today - timedelta(days=days)).strftime('%Y-%m-%d')
        to_date   = today.strftime('%Y-%m-%d')

        news = client.company_news(
            symbol,
            _from=from_date,
            to=to_date
        )

        if not news:
            return []

        cleaned = []
        for article in news[:10]:
            cleaned.append({
                "headline" : article.get('headline', ''),
                "summary"  : article.get('summary', ''),
                "source"   : article.get('source', ''),
                "url"      : article.get('url', ''),
                "datetime" : article.get('datetime', 0),
                "image"    : article.get('image', ''),
            })

        return cleaned

    except Exception as e:
        raise Exception(
            f"Finnhub news error for {symbol}: {str(e)}"
        )


def search_symbol(query: str) -> list:
    try:
        results = client.symbol_lookup(query)

        if not results or 'result' not in results:
            return []

        filtered = []
        for item in results['result']:
            if item.get('type') == 'Common Stock':
                filtered.append({
                    "symbol"     : item.get('symbol', ''),
                    "description": item.get('description', ''),
                    "type"       : item.get('type', ''),
                })
            if len(filtered) == 8:
                break

        return filtered

    except Exception as e:
        raise Exception(f"Finnhub search error: {str(e)}")


def get_market_status() -> dict:
    try:
        status = client.market_status(exchange='US')

        return {
            "is_open"  : status.get('isOpen', False),
            "session"  : "Open" if status.get('isOpen') else "Closed",
            "timezone" : status.get('timezone', 'America/New_York'),
            "holiday"  : status.get('holiday', None),
        }

    except Exception as e:
        raise Exception(f"Finnhub market status error: {str(e)}")