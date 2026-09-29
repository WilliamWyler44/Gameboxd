import os
import requests
from dotenv import load_dotenv
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
load_dotenv(str(project_root / '.env'), override=True)
load_dotenv(str(project_root / 'backend' / '.env'), override=True)
RAWG_API_KEY = os.getenv('RAWG_API_KEY')
RAWG_BASE = 'https://api.rawg.io/api'


def fetch_game_by_id_or_slug(identifier):
    """Identifier can be int id or slug string."""
    if not RAWG_API_KEY:
        return None

    # Try slug first
    url = f"{RAWG_BASE}/games/{identifier}"
    params = {'key': RAWG_API_KEY}
    try:
        r = requests.get(url, params=params, timeout=8)
        if r.status_code == 200:
            return r.json()
        # If 404 and identifier is numeric, try by id
        if r.status_code == 404:
            # attempt numeric id
            try:
                numeric = int(identifier)
                r2 = requests.get(f"{RAWG_BASE}/games/{numeric}", params=params, timeout=8)
                if r2.status_code == 200:
                    return r2.json()
            except Exception:
                # fall through to search attempt below
                pass
    except Exception:
        # network error — try search below
        pass
    # As a last resort, try RAWG search endpoint with the identifier as a query
    try:
        search_params = {'key': RAWG_API_KEY, 'search': str(identifier), 'page_size': 1}
        s = requests.get(f"{RAWG_BASE}/games", params=search_params, timeout=8)
        if s.status_code == 200:
            data = s.json()
            results = data.get('results') or []
            if results:
                return results[0]
    except Exception:
        return None

    return None
