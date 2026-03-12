def format_market_cap(value: float) -> str:
    if not value:
        return "N/A"

    if value >= 1_000_000_000_000:
        return f"${value / 1_000_000_000_000:.1f}T"
    elif value >= 1_000_000_000:
        return f"${value / 1_000_000_000:.1f}B"
    elif value >= 1_000_000:
        return f"${value / 1_000_000:.1f}M"
    else:
        return f"${value:,.0f}"


def format_volume(value: int) -> str:
    if not value:
        return "N/A"

    if value >= 1_000_000_000:
        return f"{value / 1_000_000_000:.1f}B"
    elif value >= 1_000_000:
        return f"{value / 1_000_000:.1f}M"
    elif value >= 1_000:
        return f"{value / 1_000:.1f}K"
    else:
        return str(value)


def success_response(data: dict, status: int = 200):
    return {
        "success": True,
        "data"   : data,
    }, status


def error_response(message: str, status: int = 400):
    return {
        "success": False,
        "error"  : message,
    }, status