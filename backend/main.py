from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend import models, schemas, auth, rawg
from backend.database import engine, get_db, SessionLocal
from dotenv import load_dotenv
import os
import json
import requests
from datetime import datetime, timedelta
import re
import html
from email.utils import parsedate_to_datetime
from pathlib import Path
import time
import shutil
from fastapi import File, UploadFile, Form
from typing import Tuple, Optional

project_root = Path(__file__).resolve().parent.parent
load_dotenv(str(project_root / '.env'), override=True)
load_dotenv(str(project_root / 'backend' / '.env'), override=True)

models.Base.metadata.create_all(bind=engine)

# Ensure new columns exist on users table (safe ALTER for SQLite)
from sqlalchemy import text
from sqlalchemy import func, desc
from typing import Iterable
with engine.connect() as conn:
    try:
        res = conn.execute(text("PRAGMA table_info('users')"))
        cols = [row[1] for row in res.fetchall()]
        if 'profile_pic' not in cols:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN profile_pic TEXT"))
            except Exception:
                pass
        if 'genres' not in cols:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN genres TEXT"))
            except Exception:
                pass
        if 'is_admin' not in cols:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0"))
            except Exception:
                pass
    except Exception:
        pass


def seed_initial_transactions(db: Session):
    try:
        count = db.query(models.Transaction).count()
        if count > 0:
            return

        users = db.query(models.User).all()
        user_map = {u.username: u for u in users}

        initial_orders = [
            {
                'order_id': 'GBX-894721',
                'username': 'emman_siva',
                'total_amount': 19.99,
                'payment_method': 'Credit Card (Visa •••• 5520)',
                'status': 'completed',
                'created_at': datetime.utcnow() - timedelta(days=12),
                'items': [
                    {
                        'id': 'p-1',
                        'title': 'Euro Truck Simulator 2',
                        'price': 19.99,
                        'platform': 'Steam Key',
                        'key': 'GBXD-9K3A-782F-L410',
                        'coverUrl': '/covers/donkey-kong-country-2-snes.jpg'
                    }
                ]
            },
            {
                'order_id': 'GBX-412958',
                'username': 'emman_siva',
                'total_amount': 84.98,
                'payment_method': 'Credit Card (Visa •••• 5520)',
                'status': 'completed',
                'created_at': datetime.utcnow() - timedelta(days=6),
                'items': [
                    {
                        'id': 'p-2',
                        'title': 'Hades',
                        'price': 24.99,
                        'platform': 'Steam Key',
                        'key': 'GBXD-HD48-912A-P901',
                        'coverUrl': '/covers/sonic-1-genesis.png'
                    },
                    {
                        'id': 'p-3',
                        'title': 'Fire Emblem: Three Houses',
                        'price': 59.99,
                        'platform': 'Nintendo Switch Key',
                        'key': 'GBXD-FE3H-8821-SW09',
                        'coverUrl': '/covers/donkey-kong-country-snes.png'
                    }
                ]
            },
            {
                'order_id': 'GBX-774012',
                'username': 'PSP_Guy',
                'total_amount': 14.99,
                'payment_method': 'PayPal (decastro@email.com)',
                'status': 'completed',
                'created_at': datetime.utcnow() - timedelta(days=20),
                'items': [
                    {
                        'id': 'p-4',
                        'title': 'Sonic the Hedgehog',
                        'price': 14.99,
                        'platform': 'GOG DRM-Free',
                        'key': 'GBXD-7812-984F-M001',
                        'coverUrl': '/covers/sonic-1-genesis.png'
                    }
                ]
            },
            {
                'order_id': 'GBX-629104',
                'username': 'PSP_Guy',
                'total_amount': 49.98,
                'payment_method': 'GameBoxd Wallet',
                'status': 'completed',
                'created_at': datetime.utcnow() - timedelta(days=8),
                'items': [
                    {
                        'id': 'p-5',
                        'title': 'Grand Theft Auto: Vice City Stories',
                        'price': 29.99,
                        'platform': 'PSP Digital Edition',
                        'key': 'GBXD-VCS8-3312-PSP1',
                        'coverUrl': '/covers/comix-zone-genesis.png'
                    },
                    {
                        'id': 'p-6',
                        'title': 'Crazy Taxi: Fare Wars',
                        'price': 19.99,
                        'platform': 'PSP Digital Edition',
                        'key': 'GBXD-CTFW-4421-DRV9',
                        'coverUrl': '/covers/earthworm-jim-genesis.png'
                    }
                ]
            },
            {
                'order_id': 'GBX-553198',
                'username': 'bianca_UMLI',
                'total_amount': 109.98,
                'payment_method': 'Credit Card (MasterCard •••• 3319)',
                'status': 'completed',
                'created_at': datetime.utcnow() - timedelta(days=15),
                'items': [
                    {
                        'id': 'p-7',
                        'title': 'Persona 5 Royal',
                        'price': 59.99,
                        'platform': 'Steam Key',
                        'key': 'GBXD-P5R0-7712-ATLS',
                        'coverUrl': '/covers/earthbound-snes.jpg'
                    },
                    {
                        'id': 'p-8',
                        'title': 'Octopath Traveler',
                        'price': 49.99,
                        'platform': 'Steam Key',
                        'key': 'GBXD-OCTP-5519-SQEX',
                        'coverUrl': '/covers/donkey-kong-country-2-snes.jpg'
                    }
                ]
            },
            {
                'order_id': 'GBX-310842',
                'username': 'Faith_DSLVA',
                'total_amount': 29.98,
                'payment_method': 'PayPal (faith@email.com)',
                'status': 'completed',
                'created_at': datetime.utcnow() - timedelta(days=10),
                'items': [
                    {
                        'id': 'p-9',
                        'title': 'The Sims 3',
                        'price': 19.99,
                        'platform': 'EA App Key',
                        'key': 'GBXD-SIM3-1184-EAGM',
                        'coverUrl': '/covers/donkey-kong-country-snes.png'
                    },
                    {
                        'id': 'p-10',
                        'title': 'RollerCoaster Tycoon Classic',
                        'price': 9.99,
                        'platform': 'Steam Key',
                        'key': 'GBXD-RCTC-9902-ATAR',
                        'coverUrl': '/covers/comix-zone-genesis.png'
                    }
                ]
            }
        ]

        for ord_data in initial_orders:
            uname = ord_data['username']
            usr = user_map.get(uname)
            tx = models.Transaction(
                order_id=ord_data['order_id'],
                user_id=usr.id if usr else None,
                username=uname,
                items_json=json.dumps(ord_data['items']),
                total_amount=ord_data['total_amount'],
                payment_method=ord_data['payment_method'],
                status=ord_data['status'],
                created_at=ord_data['created_at'],
            )
            db.add(tx)
        db.commit()
    except Exception as e:
        db.rollback()
        print('Error seeding transactions:', e)

# Seed transactions on startup
try:
    with SessionLocal() as db_session:
        seed_initial_transactions(db_session)
except Exception:
    pass

app = FastAPI(title='GameBoxd Backend')

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token", auto_error=False)

# Fallback URL used when a reddit post URL cannot be determined
REDDIT_NEWS_PAGE_URL = 'https://www.reddit.com/r/gamernews/new/'

# Simple in-memory cache for subreddit results to reduce Reddit calls
REDDIT_CACHE: dict = {}
REDDIT_CACHE_TTL = int(os.getenv('REDDIT_CACHE_TTL_SECONDS', '30'))

# OAuth token cache
_REDDIT_TOKEN_INFO: dict = {}

def get_reddit_oauth_token() -> Optional[str]:
    """Obtain an OAuth bearer token using client credentials if configured.
    Returns the access token or None if not available."""
    client_id = os.getenv('REDDIT_CLIENT_ID')
    client_secret = os.getenv('REDDIT_CLIENT_SECRET')
    if not client_id or not client_secret:
        return None

    now = int(time.time())
    token_info = _REDDIT_TOKEN_INFO.get('token_info')
    if token_info and token_info.get('expires_at', 0) > now + 10:
        return token_info.get('access_token')

    # Request a new token
    try:
        auth = (client_id, client_secret)
        data = {'grant_type': 'client_credentials'}
        headers = {'User-Agent': os.getenv('REDDIT_USER_AGENT', 'GameBoxd/1.0 by GameBoxd')}
        resp = requests.post('https://www.reddit.com/api/v1/access_token', auth=auth, data=data, headers=headers, timeout=10)
        resp.raise_for_status()
        j = resp.json()
        access_token = j.get('access_token')
        expires_in = int(j.get('expires_in', 3600))
        if access_token:
            _REDDIT_TOKEN_INFO['token_info'] = {
                'access_token': access_token,
                'expires_at': now + expires_in,
            }
            return access_token
    except Exception:
        return None


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def is_admin_user(user: models.User) -> bool:
    """Determine if a user is an admin based on ADMIN_USERS env var (comma-separated usernames or emails)."""
    # First, allow DB flag if present
    try:
        if getattr(user, 'is_admin', False):
            return True
    except Exception:
        pass

    admins_raw = os.getenv('ADMIN_USERS', '')
    if not admins_raw:
        return False
    admins = {a.strip().lower() for a in admins_raw.split(',') if a.strip()}
    if not admins:
        return False
    uname = (user.username or '').lower()
    email = (user.email or '').lower()
    return uname in admins or email in admins


def normalize_reddit_post(post: dict, index: int) -> dict:
    title = post.get('title') or 'Untitled'
    published_at = post.get('created_utc') or post.get('publishedAt')
    
    # Determine the best URL to use:
    # 1. For link posts: use the overridden URL (actual article)
    # 2. For self posts: try to extract URL from text or fall back to search
    article_url = post.get('url_overridden_by_dest')
    
    if not article_url and isinstance(post.get('url'), str) and post['url'].startswith('http'):
        # Check if post.url is actually an external link (not Reddit)
        url_str = post['url']
        if 'reddit.com' not in url_str and 'redd.it' not in url_str:
            article_url = url_str
    
    if not article_url:
        # Try to extract a URL from the description or title
        text_to_search = f"{post.get('selftext', '')} {post.get('title', '')}"
        import re
        url_match = re.search(r'https?://[^\s<>"{}|\\^`\[\]]+', text_to_search)
        if url_match:
            article_url = url_match.group(0)
    
    if not article_url:
        # Fallback: Reddit post URL (discussion) instead of Google search
        article_url = f"https://www.reddit.com{post.get('permalink')}" if post.get('permalink') else 'https://www.reddit.com/r/gamernews/new/'

    return {
        'id': post.get('id') or f'reddit-{index}',
        'title': title,
        'description': (post.get('selftext') or '').strip() or post.get('url_overridden_by_dest') or 'No summary available for this article.',
        'source': f"r/{post.get('subreddit') or 'gamernews'}",
        'publishedAt': published_at,
        'image': post.get('thumbnail') if isinstance(post.get('thumbnail'), str) and post.get('thumbnail').startswith('http') else '',
        'url': article_url,
    }


VALID_COLLECTION_STATUSES = {'playing', 'completed', 'library'}
LEGACY_STATUS_MAP = {
    'wishlist': 'library',
    'finished': 'completed',
    'still_in_my_library': 'library',
    'still in my library': 'library',
}


def normalize_collection_status(status_value: str | None) -> str:
    normalized = str(status_value or 'library').strip().lower().replace('-', '_')
    normalized = LEGACY_STATUS_MAP.get(normalized, normalized)
    return normalized if normalized in VALID_COLLECTION_STATUSES else 'library'


def serialize_game_entry(game: models.GameEntry) -> dict:
    return {
        'id': game.id,
        'rawg_id': game.rawg_id,
        'slug': game.slug,
        'title': game.title,
        'cover_url': game.cover_url,
        'rating': game.rating,
        'status': normalize_collection_status(game.status),
        'review': game.review,
        'added_at': game.added_at,
    }


def serialize_activity(act: models.Activity) -> dict:
    return {
        'id': act.id,
        'user_id': act.user_id,
        'game_entry_id': act.game_entry_id,
        'verb': act.verb,
        'message': act.message,
        'created_at': act.created_at,
    }


def serialize_post_comment(comment: models.PostComment, username: str, profile_pic: str | None) -> dict:
    return {
        'id': comment.id,
        'game_entry_id': comment.game_entry_id,
        'parent_id': comment.parent_id,
        'user_id': comment.user_id,
        'username': username,
        'profile_pic': profile_pic,
        'content': comment.content,
        'created_at': comment.created_at,
    }


def serialize_transaction(tx: models.Transaction) -> dict:
    items = []
    try:
        items = json.loads(tx.items_json) if tx.items_json else []
    except Exception:
        items = []

    profile_pic = None
    if tx.user and tx.user.profile_pic:
        profile_pic = tx.user.profile_pic

    return {
        'id': tx.id,
        'order_id': tx.order_id,
        'user_id': tx.user_id,
        'username': tx.username or (tx.user.username if tx.user else 'Guest'),
        'profile_pic': profile_pic,
        'items': items,
        'total_amount': float(tx.total_amount or 0.0),
        'payment_method': tx.payment_method or 'Credit Card',
        'status': tx.status or 'completed',
        'created_at': tx.created_at.isoformat() if tx.created_at else None,
    }



def serialize_user_profile(
    user: models.User,
    games: list[models.GameEntry],
    follower_count: int = 0,
    following_count: int = 0,
    is_following: bool = False,
) -> dict:
    genres = []
    try:
        if user.genres:
            genres = json.loads(user.genres)
    except Exception:
        try:
            # fallback: comma-separated
            genres = [g.strip() for g in (user.genres or '').split(',') if g.strip()]
        except Exception:
            genres = []

    return {
        'username': user.username,
        'profile_pic': user.profile_pic,
        'genres': genres,
        'games': [serialize_game_entry(g) for g in games],
        'follower_count': follower_count,
        'following_count': following_count,
        'is_following': is_following,
    }


def get_follow_counts(db: Session, user_id: int) -> tuple[int, int]:
    follower_count = db.query(models.Follow).filter(models.Follow.following_id == user_id).count()
    following_count = db.query(models.Follow).filter(models.Follow.follower_id == user_id).count()
    return follower_count, following_count


def get_follow_status(db: Session, target_user: models.User, viewer_user: models.User | None) -> dict:
    follower_count, following_count = get_follow_counts(db, target_user.id)
    is_following = False
    if viewer_user and viewer_user.id != target_user.id:
        is_following = (
            db.query(models.Follow)
            .filter(
                models.Follow.follower_id == viewer_user.id,
                models.Follow.following_id == target_user.id,
            )
            .first()
            is not None
        )
    return {
        'username': target_user.username,
        'follower_count': follower_count,
        'following_count': following_count,
        'is_following': is_following,
    }

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid authentication')
    username = payload.get('sub')
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid authentication')
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    return user


async def get_optional_user(token: str | None = Depends(optional_oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    payload = auth.decode_token(token)
    if not payload:
        return None
    username = payload.get('sub')
    if not username:
        return None
    return get_user_by_username(db, username)


@app.get('/news/reddit')
def reddit_news(limit: int = 50, subreddit: str = 'gamernews'):
    safe_limit = max(1, min(limit, 100))
    safe_subreddit = (subreddit or 'gamernews').strip().lstrip('/').replace('r/', '') or 'gamernews'

    # Server-side cache lookup
    cache_key = f"reddit:{safe_subreddit}:{safe_limit}"
    now = int(time.time())
    cached = REDDIT_CACHE.get(cache_key)
    if cached and cached.get('ts', 0) + REDDIT_CACHE_TTL > now:
        return {'posts': cached.get('posts', [])}

    # Prefer using Reddit OAuth API if credentials are configured
    token = get_reddit_oauth_token()
    if token:
        try:
            oauth_url = f'https://oauth.reddit.com/r/{safe_subreddit}/new.json?limit={safe_limit}&raw_json=1'
            headers = {
                'Authorization': f'Bearer {token}',
                'User-Agent': os.getenv('REDDIT_USER_AGENT', 'GameBoxd/1.0 by GameBoxd'),
            }
            resp = requests.get(oauth_url, headers=headers, timeout=10)
            resp.raise_for_status()
            json_data = resp.json()
            posts = json_data.get('data', {}).get('children', [])
            normalized_posts = [normalize_reddit_post(entry.get('data', {}), index) for index, entry in enumerate(posts)]

            def is_self_promotion(post):
                title = (post.get('title') or '').lower()
                text = (post.get('selftext') or '').lower()
                if 'megathread' in title or 'megathread' in text:
                    if 'self' in title or 'self' in text or 'promotion' in title or 'promotion' in text:
                        return True
                if re.search(r'\bself[-\s]?promotion\b', title) or re.search(r'\bself[-\s]?promotion\b', text):
                    return True
                if 'self promo' in title or 'self promo' in text:
                    return True
                return False

            filtered = [p for p in normalized_posts if not is_self_promotion(p)]
            REDDIT_CACHE[cache_key] = {'ts': now, 'posts': filtered}
            return {'posts': filtered}
        except Exception:
            # fall through to legacy scraping/RSS/proxy approach below
            pass

    # Legacy fallback: try public JSON endpoint (old.reddit) and RSS/proxy as before
    url = f'https://old.reddit.com/r/{safe_subreddit}/new.json?limit={safe_limit}&raw_json=1'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        json_data = response.json()
        posts = json_data.get('data', {}).get('children', [])
        normalized_posts = [normalize_reddit_post(entry.get('data', {}), index) for index, entry in enumerate(posts)]
        
        # Filter out known unwanted threads (e.g., Self-Promotion Megathread)
        def is_self_promotion(post):
            title = (post.get('title') or '').lower()
            text = (post.get('selftext') or '').lower()
            if 'megathread' in title or 'megathread' in text:
                if 'self' in title or 'self' in text or 'promotion' in title or 'promotion' in text:
                    return True
            # common phrasing
            if re.search(r'\bself[-\s]?promotion\b', title) or re.search(r'\bself[-\s]?promotion\b', text):
                return True
            if 'self promo' in title or 'self promo' in text:
                return True
            return False

        filtered = [p for p in normalized_posts if not is_self_promotion(p)]
        REDDIT_CACHE[cache_key] = {'ts': now, 'posts': filtered}
        return {'posts': filtered}
    except Exception:
        # If the JSON endpoint is blocked (403), try the subreddit's RSS/Atom feed as a fallback
        try:
            rss_url = f'https://www.reddit.com/r/{safe_subreddit}/.rss'
            r2 = requests.get(rss_url, headers=headers, timeout=10)
            r2.raise_for_status()
            import xml.etree.ElementTree as ET

            root = ET.fromstring(r2.content)
            # Attempt to find Atom entries first, then generic entry/item
            ns_atom = '{http://www.w3.org/2005/Atom}'
            entries = root.findall('.//' + ns_atom + 'entry') or root.findall('.//entry') or root.findall('.//item')
            normalized_posts = []

            def local_name(tag):
                return tag.split('}')[-1].lower() if isinstance(tag, str) else ''

            def strip_tags(text):
                if not text:
                    return ''
                t = html.unescape(text)
                t = re.sub(r'<[^>]+>', ' ', t)
                return re.sub(r'\s+', ' ', t).strip()

            def extract_article_url_from_html(raw_html):
                """Extract first external (non-Reddit) href from RSS content HTML."""
                if not raw_html:
                    return None
                unescaped = html.unescape(raw_html)
                for match in re.finditer(r'href=["\']([^"\']+)["\']', unescaped):
                    href = match.group(1)
                    if href.startswith('http') and 'reddit.com' not in href and 'redd.it' not in href:
                        return href
                return None

            for index, entry in enumerate(entries):
                title = ''
                url = ''
                permalink = ''
                summary = ''
                raw_content_html = ''
                thumbnail = ''
                published = None

                # scan direct children first
                for child in entry:
                    lname = local_name(child.tag)
                    # title
                    if not title and lname == 'title' and (child.text and child.text.strip()):
                        title = child.text.strip()
                    # link: prefer href attribute, else child text
                    if lname == 'link':
                        href = child.get('href') or child.get('url') or (child.text or '').strip()
                        rel = (child.get('rel') or '').lower()
                        if href and (not url or rel == 'alternate'):
                            url = href
                    # guid
                    if not url and lname == 'guid' and (child.text and child.text.strip()):
                        url = child.text.strip()
                    # enclosure may include image
                    if lname == 'enclosure' and not thumbnail:
                        thumbnail = child.get('url') or child.get('href') or thumbnail
                    # media:thumbnail
                    if lname == 'thumbnail' and not thumbnail:
                        thumbnail = child.get('url') or child.get('href') or (child.text or '')
                    # summary/content/description
                    if not summary and lname in ('summary', 'content', 'description') and child.text:
                        summary = strip_tags(child.text)
                    # summary/content/description — capture raw HTML before stripping
                    if lname in ('summary', 'content', 'description') and child.text:
                        if not raw_content_html:
                            raw_content_html = child.text
                        if not summary:
                            summary = strip_tags(child.text)
                    # content:encoded often appears with localname 'encoded'
                    if not summary and lname == 'encoded' and child.text:
                        summary = strip_tags(child.text)
                    if lname == 'encoded' and child.text:
                        if not raw_content_html:
                            raw_content_html = child.text
                        if not summary:
                            summary = strip_tags(child.text)
                    # published/updated/pubDate
                    if not published and lname in ('published', 'updated', 'pubdate', 'date', 'dc:date') and child.text:
                        published = child.text.strip()

                # fallback: search deeper if key fields missing
                if not title:
                    for el in entry.iter():
                        if local_name(el.tag) == 'title' and el.text and el.text.strip():
                            title = el.text.strip()
                            break

                if not url:
                    # try to extract from link tags with href deeper in tree
                    for el in entry.iter():
                        if local_name(el.tag) == 'link':
                            href = el.get('href') or el.get('url') or (el.text or '').strip()
                            if href:
                                url = href
                                break

                if not raw_content_html:
                    for el in entry.iter():
                        if local_name(el.tag) in ('summary', 'content', 'description', 'encoded') and el.text:
                            summary = strip_tags(el.text)
                            raw_content_html = el.text
                            if not summary:
                                summary = strip_tags(el.text)
                            break
                elif not summary:
                    summary = strip_tags(raw_content_html)

                if not thumbnail:
                    for el in entry.iter():
                        if local_name(el.tag) in ('thumbnail', 'media:thumbnail', 'enclosure'):
                            thumbnail = el.get('url') or el.get('href') or (el.text or '')
                            if thumbnail:
                                break

                # parse published date to ISO if possible
                published_iso = None
                if published:
                    try:
                        dt = parsedate_to_datetime(published)
                        published_iso = dt.isoformat()
                    except Exception:
                        published_iso = published

                # Try to extract the real article URL from the RSS content HTML.
                # Reddit RSS <link> tags point to the Reddit discussion; the actual
                # article link is an <a href="..."> inside the content/summary HTML.
                article_url_from_content = extract_article_url_from_html(raw_content_html)

                # normalize permalink for reddit if possible
                if url and url.startswith('https://www.reddit.com'):
                    permalink = url.replace('https://www.reddit.com', '')

                post = {
                    'id': f'rss-{index}',
                    'title': title or 'Untitled',
                    'selftext': summary or '',
                    'subreddit': safe_subreddit,
                    'permalink': permalink,
                    'url': url or REDDIT_NEWS_PAGE_URL,
                    # Prefer the extracted article URL; fall back to the RSS link
                    'url': article_url_from_content or url or REDDIT_NEWS_PAGE_URL,
                    'url_overridden_by_dest': article_url_from_content or '',
                    'thumbnail': thumbnail or '',
                    'publishedAt': published_iso,
                }
                normalized_posts.append(normalize_reddit_post(post, index))

            filtered = []
            for p in normalized_posts:
                t = (p.get('title') or '').lower()
                d = (p.get('description') or '').lower()
                if ('megathread' in t or 'megathread' in d) and ('self' in t or 'self' in d or 'promotion' in t or 'promotion' in d):
                    continue
                if re.search(r'\bself[-\s]?promotion\b', t) or re.search(r'\bself[-\s]?promotion\b', d):
                    continue
                if 'self promo' in t or 'self promo' in d:
                    continue
                filtered.append(p)
            REDDIT_CACHE[cache_key] = {'ts': now, 'posts': filtered}
            return {'posts': filtered}
        except Exception as exc2:
            # As a last resort, try a lightweight scraping proxy to retrieve JSON
            try:
                proxy_url = f'https://r.jina.ai/http://www.reddit.com/r/{safe_subreddit}/new.json?raw_json=1'
                proxy_resp = requests.get(proxy_url, headers=headers, timeout=10)
                proxy_resp.raise_for_status()
                json_data = proxy_resp.json()
                posts = json_data.get('data', {}).get('children', [])
                normalized_posts = [normalize_reddit_post(entry.get('data', {}), index) for index, entry in enumerate(posts)]
                filtered = []
                for p in normalized_posts:
                    t = (p.get('title') or '').lower()
                    d = (p.get('description') or '').lower()
                    if ('megathread' in t or 'megathread' in d) and ('self' in t or 'self' in d or 'promotion' in t or 'promotion' in d):
                        continue
                    if re.search(r'\bself[-\s]?promotion\b', t) or re.search(r'\bself[-\s]?promotion\b', d):
                        continue
                    if 'self promo' in t or 'self promo' in d:
                        continue
                    filtered.append(p)
                REDDIT_CACHE[cache_key] = {'ts': now, 'posts': filtered}
                return {'posts': filtered}
            except Exception as exc3:
                raise HTTPException(status_code=502, detail=f'Could not load Reddit news: {exc3}')


@app.post('/signup', response_model=schemas.UserOut)
async def signup(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    avatar: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    if get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail='Username already taken')
    if get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail='Email already registered')
    try:
        hashed = auth.get_password_hash(password)
    except ValueError as e:
        # bcrypt has a 72-byte limit; surface a 400 error instead of crashing
        raise HTTPException(status_code=400, detail=str(e))

    user = models.User(username=username, email=email, hashed_password=hashed)
    # handle optional avatar upload
    if avatar is not None:
        try:
            avatars_dir = project_root / 'public' / 'avatars'
            avatars_dir.mkdir(parents=True, exist_ok=True)
            orig_name = Path(avatar.filename or '')
            ext = orig_name.suffix or '.png'
            safe_name = f"{username}_{int(time.time())}{ext}"
            dest = avatars_dir / safe_name
            with dest.open('wb') as out_f:
                shutil.copyfileobj(avatar.file, out_f)
            user.profile_pic = f"/avatars/{safe_name}"
        except Exception:
            # ignore avatar errors but continue creating user
            pass

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post('/token', response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail='Incorrect username or password')
    try:
        valid = auth.verify_password(form_data.password, user.hashed_password)
    except ValueError as e:
        # bcrypt raises on passwords >72 bytes; return a clear 400 instead of 500
        raise HTTPException(status_code=400, detail=str(e))
    if not valid:
        raise HTTPException(status_code=400, detail='Incorrect username or password')
    access_token_expires = timedelta(minutes=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '1440')))
    access_token = auth.create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post('/games', response_model=schemas.GameOut)
async def add_game(entry: schemas.GameCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Validate via RAWG
    # If RAWG API key is not configured, return a clear 500 to help debugging
    if not getattr(rawg, 'RAWG_API_KEY', None):
        raise HTTPException(status_code=500, detail='RAWG API key not configured on server')

    game = rawg.fetch_game_by_id_or_slug(entry.rawg_id)
    if not game:
        raise HTTPException(status_code=400, detail=f"RAWG could not find that game ({entry.rawg_id})")
    existing_entry = (
        db.query(models.GameEntry)
        .filter(models.GameEntry.user_id == current_user.id, models.GameEntry.rawg_id == game.get('id'))
        .first()
    )
    if existing_entry:
        raise HTTPException(status_code=400, detail='You already made a Post')
    # Create entry
    new = models.GameEntry(
        user_id=current_user.id,
        rawg_id=game.get('id'),
        slug=game.get('slug'),
        title=game.get('name'),
        cover_url=game.get('background_image'),
        status=normalize_collection_status(entry.status),
        review=entry.review,
        rating=entry.rating,
    )
    db.add(new)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        # Surface the database error to help debugging (frontend will receive message)
        err_msg = str(e)
        if 'uix_user_rawg' in err_msg or 'UNIQUE constraint failed: game_entries.user_id, game_entries.rawg_id' in err_msg:
            raise HTTPException(status_code=400, detail='You already made a Post')
        raise HTTPException(status_code=400, detail=f'Could not add game: {err_msg}')
    db.refresh(new)
    # log activity
    try:
        act = models.Activity(user_id=current_user.id, game_entry_id=new.id, verb='added', message=f'Added {new.title}')
        db.add(act)
        db.commit()
    except Exception:
        db.rollback()

    # Notify followers that this user made a new post.
    try:
        followers = (
            db.query(models.Follow)
            .filter(models.Follow.following_id == current_user.id)
            .all()
        )
        notifications = []
        for follow in followers:
            notifications.append(
                models.FollowNotification(
                    recipient_user_id=follow.follower_id,
                    actor_user_id=current_user.id,
                    game_entry_id=new.id,
                    verb='new_post',
                    message=f"{current_user.username} posted {new.title or 'a new game'}",
                    is_read=False,
                )
            )
        if notifications:
            db.add_all(notifications)
            db.commit()
    except Exception:
        db.rollback()
    return serialize_game_entry(new)

@app.get('/games', response_model=list[schemas.GameOut])
async def list_games(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    games = db.query(models.GameEntry).filter(models.GameEntry.user_id == current_user.id).order_by(models.GameEntry.added_at.desc()).all()
    return [serialize_game_entry(game) for game in games]

@app.put('/games/{game_id}', response_model=schemas.GameOut)
async def update_game(game_id: int, payload: schemas.GameCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    game = db.query(models.GameEntry).filter(models.GameEntry.id == game_id, models.GameEntry.user_id == current_user.id).first()
    if not game:
        raise HTTPException(status_code=404, detail='Game not found')
    game.status = normalize_collection_status(payload.status)
    game.review = payload.review
    game.rating = payload.rating
    db.add(game)
    db.commit()
    db.refresh(game)
    # log activity
    try:
        act = models.Activity(user_id=current_user.id, game_entry_id=game.id, verb='updated', message=f'Updated {game.title}')
        db.add(act)
        db.commit()
    except Exception:
        db.rollback()
    return serialize_game_entry(game)

@app.delete('/games/{game_id}')
async def delete_game(game_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    game = db.query(models.GameEntry).filter(models.GameEntry.id == game_id, models.GameEntry.user_id == current_user.id).first()
    if not game:
        raise HTTPException(status_code=404, detail='Game not found')
    # record activity before deletion
    try:
        act = models.Activity(user_id=current_user.id, game_entry_id=game.id, verb='removed', message=f'Removed {game.title}')
        db.add(act)
        db.commit()
    except Exception:
        db.rollback()
    # Remove follow notifications tied to this post.
    db.query(models.FollowNotification).filter(models.FollowNotification.game_entry_id == game.id).delete(synchronize_session=False)
    db.delete(game)
    db.commit()
    return {'ok': True}


@app.get('/activity', response_model=list[schemas.ActivityOut])
async def get_activity(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    acts = db.query(models.Activity).filter(models.Activity.user_id == current_user.id).order_by(models.Activity.created_at.desc()).limit(50).all()
    return [serialize_activity(a) for a in acts]


@app.get('/users/search', response_model=list[schemas.UserSearchResult])
async def search_users(q: str = '', limit: int = 6, db: Session = Depends(get_db)):
    """Search for users by username (case-insensitive LIKE query)."""
    if not q or not q.strip():
        return []
    search_term = f"%{q.strip().lower()}%"
    users = db.query(models.User).filter(
        models.User.username.ilike(search_term)
    ).limit(min(limit, 20)).all()
    return [{'username': u.username, 'profile_pic': u.profile_pic} for u in users]


@app.get('/users/{username}', response_model=schemas.UserProfileOut)
async def get_user_profile(username: str, db: Session = Depends(get_db), current_user: models.User | None = Depends(get_optional_user)):
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    games = db.query(models.GameEntry).filter(models.GameEntry.user_id == user.id).order_by(models.GameEntry.added_at.desc()).all()
    status_payload = get_follow_status(db, user, current_user)
    return serialize_user_profile(
        user,
        games,
        follower_count=status_payload['follower_count'],
        following_count=status_payload['following_count'],
        is_following=status_payload['is_following'],
    )


@app.get('/users/{username}/follow-status', response_model=schemas.FollowStatusOut)
async def get_user_follow_status(username: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return get_follow_status(db, user, current_user)


@app.post('/users/{username}/follow', response_model=schemas.FollowActionOut)
async def follow_user(username: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    target = get_user_by_username(db, username)
    if not target:
        raise HTTPException(status_code=404, detail='User not found')
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail='You cannot follow yourself')

    existing = (
        db.query(models.Follow)
        .filter(models.Follow.follower_id == current_user.id, models.Follow.following_id == target.id)
        .first()
    )
    if not existing:
        db.add(models.Follow(follower_id=current_user.id, following_id=target.id))
        try:
            db.commit()
        except Exception:
            db.rollback()

        # Notify the target user that they were followed.
        try:
            follow_event = models.FollowEventNotification(
                recipient_user_id=target.id,
                actor_user_id=current_user.id,
                verb='followed_you',
                message=f'{current_user.username} followed you',
                is_read=False,
            )
            db.add(follow_event)
            db.commit()
        except Exception:
            db.rollback()

    status_payload = get_follow_status(db, target, current_user)
    return {
        'ok': True,
        'username': target.username,
        'is_following': True,
        'follower_count': status_payload['follower_count'],
        'following_count': status_payload['following_count'],
    }


@app.delete('/users/{username}/follow', response_model=schemas.FollowActionOut)
async def unfollow_user(username: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    target = get_user_by_username(db, username)
    if not target:
        raise HTTPException(status_code=404, detail='User not found')
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail='You cannot unfollow yourself')

    db.query(models.Follow).filter(
        models.Follow.follower_id == current_user.id,
        models.Follow.following_id == target.id,
    ).delete(synchronize_session=False)
    db.commit()

    status_payload = get_follow_status(db, target, current_user)
    return {
        'ok': True,
        'username': target.username,
        'is_following': False,
        'follower_count': status_payload['follower_count'],
        'following_count': status_payload['following_count'],
    }


@app.get('/me/notifications/followed-posts', response_model=list[schemas.FollowNotificationOut])
async def get_follow_notifications(limit: int = 20, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    safe_limit = max(1, min(limit, 100))

    post_rows = (
        db.query(
            models.FollowNotification,
            models.User.username,
            models.User.profile_pic,
            models.GameEntry.title,
            models.GameEntry.cover_url,
        )
        .join(models.User, models.FollowNotification.actor_user_id == models.User.id)
        .join(models.GameEntry, models.FollowNotification.game_entry_id == models.GameEntry.id)
        .filter(models.FollowNotification.recipient_user_id == current_user.id)
        .order_by(models.FollowNotification.created_at.desc())
        .limit(safe_limit)
        .all()
    )

    follow_rows = (
        db.query(
            models.FollowEventNotification,
            models.User.username,
            models.User.profile_pic,
        )
        .join(models.User, models.FollowEventNotification.actor_user_id == models.User.id)
        .filter(models.FollowEventNotification.recipient_user_id == current_user.id)
        .order_by(models.FollowEventNotification.created_at.desc())
        .limit(safe_limit)
        .all()
    )

    combined = []

    for notif, actor_username, actor_profile_pic, game_title, game_cover in post_rows:
        combined.append({
            'id': notif.id,
            'verb': notif.verb,
            'actor_username': actor_username,
            'actor_profile_pic': actor_profile_pic,
            'game_entry_id': notif.game_entry_id,
            'game_title': game_title,
            'game_cover_url': game_cover,
            'message': notif.message,
            'is_read': bool(notif.is_read),
            'created_at': notif.created_at,
        })

    for notif, actor_username, actor_profile_pic in follow_rows:
        combined.append({
            'id': notif.id,
            'verb': notif.verb,
            'actor_username': actor_username,
            'actor_profile_pic': actor_profile_pic,
            'game_entry_id': None,
            'game_title': None,
            'game_cover_url': None,
            'message': notif.message,
            'is_read': bool(notif.is_read),
            'created_at': notif.created_at,
        })

    combined.sort(key=lambda item: item.get('created_at') or 0, reverse=True)
    return combined[:safe_limit]


@app.get('/me/notifications/followed-posts/unread-count')
async def get_follow_notifications_unread_count(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    post_count = (
        db.query(models.FollowNotification)
        .filter(
            models.FollowNotification.recipient_user_id == current_user.id,
            models.FollowNotification.is_read == False,
        )
        .count()
    )
    follow_count = (
        db.query(models.FollowEventNotification)
        .filter(
            models.FollowEventNotification.recipient_user_id == current_user.id,
            models.FollowEventNotification.is_read == False,
        )
        .count()
    )
    return {'unread_count': post_count + follow_count}


@app.post('/me/notifications/followed-posts/read-all')
async def mark_follow_notifications_read(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    (
        db.query(models.FollowNotification)
        .filter(
            models.FollowNotification.recipient_user_id == current_user.id,
            models.FollowNotification.is_read == False,
        )
        .update({'is_read': True}, synchronize_session=False)
    )
    (
        db.query(models.FollowEventNotification)
        .filter(
            models.FollowEventNotification.recipient_user_id == current_user.id,
            models.FollowEventNotification.is_read == False,
        )
        .update({'is_read': True}, synchronize_session=False)
    )
    db.commit()
    return {'ok': True}


@app.get('/me/feed/following', response_model=list[schemas.FollowingFeedItemOut])
async def get_following_feed(limit: int = 20, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    safe_limit = max(1, min(limit, 100))
    rows = (
        db.query(
            models.GameEntry,
            models.User.username,
            models.User.profile_pic,
        )
        .join(models.User, models.GameEntry.user_id == models.User.id)
        .join(models.Follow, models.Follow.following_id == models.GameEntry.user_id)
        .filter(models.Follow.follower_id == current_user.id)
        .order_by(models.GameEntry.added_at.desc())
        .limit(safe_limit)
        .all()
    )

    return [
        {
            'id': game.id,
            'post_id': game.id,
            'author_username': username,
            'author_profile_pic': profile_pic,
            'title': game.title,
            'cover_url': game.cover_url,
            'review': game.review,
            'status': normalize_collection_status(game.status),
            'rating': game.rating,
            'added_at': game.added_at,
        }
        for game, username, profile_pic in rows
    ]


@app.put('/me/profile', response_model=schemas.UserProfileOut)
async def update_my_profile(payload: schemas.ProfileUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # update profile_pic and genres (store genres as JSON list)
    if payload.profile_pic is not None:
        current_user.profile_pic = payload.profile_pic
    if payload.genres is not None:
        try:
            current_user.genres = json.dumps(payload.genres)
        except Exception:
            current_user.genres = ','.join(payload.genres or [])
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    games = db.query(models.GameEntry).filter(models.GameEntry.user_id == current_user.id).order_by(models.GameEntry.added_at.desc()).all()
    follower_count, following_count = get_follow_counts(db, current_user.id)
    return serialize_user_profile(current_user, games, follower_count=follower_count, following_count=following_count, is_following=False)


@app.post('/me/avatar', response_model=schemas.UserProfileOut)
async def upload_my_avatar(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Save uploaded avatar to public/avatars and update user's profile_pic
    avatars_dir = project_root / 'public' / 'avatars'
    try:
        avatars_dir.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass
    ext = ''
    try:
        ext = Path(file.filename).suffix
    except Exception:
        ext = ''
    filename = f"{current_user.username}_{int(time.time())}{ext}"
    dest = avatars_dir / filename
    try:
        with dest.open('wb') as f:
            shutil.copyfileobj(file.file, f)
        current_user.profile_pic = f"/avatars/{filename}"
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail='Could not save avatar')
    games = db.query(models.GameEntry).filter(models.GameEntry.user_id == current_user.id).order_by(models.GameEntry.added_at.desc()).all()
    follower_count, following_count = get_follow_counts(db, current_user.id)
    return serialize_user_profile(current_user, games, follower_count=follower_count, following_count=following_count, is_following=False)


@app.get('/games/rawg/{rawg_id}/reviews', response_model=list[schemas.GameReviewOut])
async def get_game_reviews(rawg_id: int, db: Session = Depends(get_db)):
    # Fetch all reviews (ratings/reviews) for a specific RAWG game
    reviews = db.query(
        models.User.username,
        models.User.profile_pic,
        models.GameEntry.rating,
        models.GameEntry.review,
        models.GameEntry.added_at
    ).join(
        models.User, models.GameEntry.user_id == models.User.id
    ).filter(
        models.GameEntry.rawg_id == rawg_id,
        (models.GameEntry.rating != None) | (models.GameEntry.review != None)
    ).order_by(
        models.GameEntry.added_at.desc()
    ).all()
    
    return [
        {
            'username': r[0],
            'profile_pic': r[1],
            'rating': r[2],
            'review': r[3],
            'added_at': r[4],
        }
        for r in reviews
    ]


@app.get('/posts/{game_entry_id}/comments', response_model=list[schemas.PostCommentOut])
async def get_post_comments(game_entry_id: int, sort: str | None = None, db: Session = Depends(get_db), current_user: models.User | None = Depends(get_optional_user)):
    post = db.query(models.GameEntry).filter(models.GameEntry.id == game_entry_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')

    rows = db.query(
        models.PostComment,
        models.User.username,
        models.User.profile_pic,
    ).join(
        models.User,
        models.PostComment.user_id == models.User.id,
    ).filter(
        models.PostComment.game_entry_id == game_entry_id,
    ).all()

    comment_ids = [comment.id for comment, _, _ in rows]
    like_counts = {}
    dislike_counts = {}
    my_reactions = {}

    if comment_ids:
        reactions = db.query(models.CommentReaction).filter(models.CommentReaction.comment_id.in_(comment_ids)).all()
        for reaction in reactions:
            if reaction.value == 1:
                like_counts[reaction.comment_id] = like_counts.get(reaction.comment_id, 0) + 1
            elif reaction.value == -1:
                dislike_counts[reaction.comment_id] = dislike_counts.get(reaction.comment_id, 0) + 1
            if current_user and reaction.user_id == current_user.id:
                my_reactions[reaction.comment_id] = reaction.value

    payload = []
    for comment, username, profile_pic in rows:
        item = serialize_post_comment(comment, username, profile_pic)
        item['like_count'] = like_counts.get(comment.id, 0)
        item['dislike_count'] = dislike_counts.get(comment.id, 0)
        item['my_reaction'] = my_reactions.get(comment.id, 0)
        payload.append(item)

    # Sorting support: 'top' => most liked first, 'new' => newest first, default => oldest first
    if sort == 'top':
        payload.sort(key=lambda it: (it.get('like_count', 0), it.get('created_at')), reverse=True)
    elif sort == 'new':
        payload.sort(key=lambda it: it.get('created_at'), reverse=True)
    else:
        payload.sort(key=lambda it: it.get('created_at'))

    return payload


@app.post('/posts/{game_entry_id}/comments', response_model=schemas.PostCommentOut)
async def add_post_comment(
    game_entry_id: int,
    payload: schemas.PostCommentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(models.GameEntry).filter(models.GameEntry.id == game_entry_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')

    content = (payload.content or '').strip()
    if not content:
        raise HTTPException(status_code=400, detail='Comment cannot be empty')

    parent_id = payload.parent_id
    if parent_id is not None:
        parent = db.query(models.PostComment).filter(models.PostComment.id == parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail='Parent comment not found')
        if parent.game_entry_id != game_entry_id:
            raise HTTPException(status_code=400, detail='Reply must belong to the same post')

    new_comment = models.PostComment(
        game_entry_id=game_entry_id,
        user_id=current_user.id,
        parent_id=parent_id,
        content=content,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return serialize_post_comment(new_comment, current_user.username, current_user.profile_pic)


def summarize_post_reactions(db: Session, game_entry_id: int, current_user_id: int | None = None):
    reactions = db.query(models.PostReaction).filter(models.PostReaction.game_entry_id == game_entry_id).all()
    likes = 0
    dislikes = 0
    my_reaction = 0
    for reaction in reactions:
        if reaction.value == 1:
            likes += 1
        elif reaction.value == -1:
            dislikes += 1
        if current_user_id and reaction.user_id == current_user_id:
            my_reaction = reaction.value
    return {'likes': likes, 'dislikes': dislikes, 'my_reaction': my_reaction}


def summarize_comment_reactions(db: Session, comment_id: int, current_user_id: int | None = None):
    reactions = db.query(models.CommentReaction).filter(models.CommentReaction.comment_id == comment_id).all()
    likes = 0
    dislikes = 0
    my_reaction = 0
    for reaction in reactions:
        if reaction.value == 1:
            likes += 1
        elif reaction.value == -1:
            dislikes += 1
        if current_user_id and reaction.user_id == current_user_id:
            my_reaction = reaction.value
    return {'likes': likes, 'dislikes': dislikes, 'my_reaction': my_reaction}


@app.get('/posts/{game_entry_id}/reactions', response_model=schemas.ReactionSummaryOut)
async def get_post_reactions(game_entry_id: int, db: Session = Depends(get_db), current_user: models.User | None = Depends(get_optional_user)):
    post = db.query(models.GameEntry).filter(models.GameEntry.id == game_entry_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    return summarize_post_reactions(db, game_entry_id, current_user.id if current_user else None)


@app.post('/posts/{game_entry_id}/reactions', response_model=schemas.ReactionSummaryOut)
async def react_to_post(
    game_entry_id: int,
    payload: schemas.ReactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.value not in (1, -1):
        raise HTTPException(status_code=400, detail='Invalid reaction value')
    post = db.query(models.GameEntry).filter(models.GameEntry.id == game_entry_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')

    existing = db.query(models.PostReaction).filter(
        models.PostReaction.game_entry_id == game_entry_id,
        models.PostReaction.user_id == current_user.id,
    ).first()

    if existing and existing.value == payload.value:
        db.delete(existing)
    elif existing:
        existing.value = payload.value
        db.add(existing)
    else:
        db.add(models.PostReaction(game_entry_id=game_entry_id, user_id=current_user.id, value=payload.value))

    db.commit()
    return summarize_post_reactions(db, game_entry_id, current_user.id)


@app.get('/comments/{comment_id}/reactions', response_model=schemas.ReactionSummaryOut)
async def get_comment_reactions(comment_id: int, db: Session = Depends(get_db), current_user: models.User | None = Depends(get_optional_user)):
    comment = db.query(models.PostComment).filter(models.PostComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail='Comment not found')
    return summarize_comment_reactions(db, comment_id, current_user.id if current_user else None)


@app.post('/comments/{comment_id}/reactions', response_model=schemas.ReactionSummaryOut)
async def react_to_comment(
    comment_id: int,
    payload: schemas.ReactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.value not in (1, -1):
        raise HTTPException(status_code=400, detail='Invalid reaction value')
    comment = db.query(models.PostComment).filter(models.PostComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail='Comment not found')

    existing = db.query(models.CommentReaction).filter(
        models.CommentReaction.comment_id == comment_id,
        models.CommentReaction.user_id == current_user.id,
    ).first()

    if existing and existing.value == payload.value:
        db.delete(existing)
    elif existing:
        existing.value = payload.value
        db.add(existing)
    else:
        db.add(models.CommentReaction(comment_id=comment_id, user_id=current_user.id, value=payload.value))

    db.commit()
    return summarize_comment_reactions(db, comment_id, current_user.id)


# Admin endpoints
@app.get('/admin/stats')
async def get_admin_stats(db: Session = Depends(get_db)):
    """Get admin statistics: total users, posts, and ROMs."""
    total_users = db.query(models.User).count()
    total_posts = db.query(models.GameEntry).count()
    
    # Count ROMs in public/roms directory
    roms_dir = project_root / 'public' / 'roms'
    total_roms = 0
    if roms_dir.exists():
        total_roms = len([f for f in roms_dir.iterdir() if f.is_file()])
    
    return {
        'total_users': total_users,
        'total_posts': total_posts,
        'total_roms': total_roms
    }


@app.get('/admin/users')
async def get_admin_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get list of all users (admin only)."""
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail='Admin privileges required')

    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    return [
        {
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'created_at': u.created_at.isoformat(),
            'is_admin': bool(getattr(u, 'is_admin', False))
        }
        for u in users
    ]


@app.post('/admin/users')
async def create_admin_user(payload: schemas.AdminUserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new user (admin-only for setting is_admin flag)."""
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail='Admin privileges required')

    # Validate uniqueness
    if get_user_by_username(db, payload.username):
        raise HTTPException(status_code=400, detail='Username already taken')
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail='Email already registered')

    try:
        hashed = auth.get_password_hash(payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user = models.User(username=payload.username, email=payload.email, hashed_password=hashed, is_admin=bool(payload.is_admin))
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Error creating user: {str(e)}')

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat(),
        'is_admin': bool(user.is_admin)
    }


@app.put('/admin/users/{user_id}/admin')
async def set_user_admin_flag(user_id: int, is_admin: bool, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Set or unset a user's is_admin flag (admin-only)."""
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail='Admin privileges required')

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    try:
        user.is_admin = bool(is_admin)
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Could not update user: {str(e)}')

    return {'id': user.id, 'username': user.username, 'is_admin': bool(user.is_admin)}


@app.delete('/admin/users/{user_id}')
async def delete_admin_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Delete a user and all of their associated posts, reactions, activities and game entries."""
    # Require admin privileges
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail='Admin privileges required')

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    try:
        db.query(models.Follow).filter(
            (models.Follow.follower_id == user_id) | (models.Follow.following_id == user_id)
        ).delete(synchronize_session=False)

        db.query(models.FollowNotification).filter(
            (models.FollowNotification.recipient_user_id == user_id) | (models.FollowNotification.actor_user_id == user_id)
        ).delete(synchronize_session=False)

        db.query(models.FollowEventNotification).filter(
            (models.FollowEventNotification.recipient_user_id == user_id) | (models.FollowEventNotification.actor_user_id == user_id)
        ).delete(synchronize_session=False)

        # Remove direct reactions made by the user
        db.query(models.PostReaction).filter(models.PostReaction.user_id == user_id).delete(synchronize_session=False)
        db.query(models.CommentReaction).filter(models.CommentReaction.user_id == user_id).delete(synchronize_session=False)

        # Remove comments authored by the user
        db.query(models.PostComment).filter(models.PostComment.user_id == user_id).delete(synchronize_session=False)

        # Remove game entries (will cascade comments/reactions on those entries)
        db.query(models.GameEntry).filter(models.GameEntry.user_id == user_id).delete(synchronize_session=False)

        # Remove activity log entries
        db.query(models.Activity).filter(models.Activity.user_id == user_id).delete(synchronize_session=False)

        # Finally remove the user record
        db.delete(user)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Could not delete user: {str(e)}')

    return {'ok': True}


@app.get('/admin/roms')
async def get_admin_roms():
    """Get list of ROMs in public/roms directory."""
    roms_dir = project_root / 'public' / 'roms'
    roms = []
    if roms_dir.exists():
        items = []
        for f in roms_dir.iterdir():
            # Skip directories and metadata sidecar files
            if not f.is_file():
                continue
            if f.name.endswith('.meta.json'):
                continue
            meta = {'description': '', 'cover_url': ''}
            try:
                meta_path = roms_dir / f"{f.name}.meta.json"
                if meta_path.exists():
                    with meta_path.open('r', encoding='utf-8') as mf:
                        try:
                            m = json.load(mf)
                            meta.update({k: m.get(k, '') for k in ('description', 'cover_url')})
                        except Exception:
                            pass
            except Exception:
                pass
            items.append({
                'filename': f.name,
                'size': f.stat().st_size,
                'modified': f.stat().st_mtime,
                'description': meta.get('description', ''),
                'cover_url': meta.get('cover_url', ''),
            })
        roms = sorted(items, key=lambda x: x['filename'])
    return roms


@app.get('/admin/posts_by_user')
async def get_posts_by_user(db: Session = Depends(get_db)):
    """Return a list of users with their post counts (game entries)."""
    # Left join users with game entries and aggregate counts
    rows = (
        db.query(models.User.id, models.User.username, func.count(models.GameEntry.id).label('post_count'))
        .outerjoin(models.GameEntry, models.GameEntry.user_id == models.User.id)
        .group_by(models.User.id)
        .order_by(desc(func.count(models.GameEntry.id)))
        .all()
    )

    return [
        {'user_id': r[0], 'username': r[1], 'post_count': int(r[2])}
        for r in rows
    ]


# ROM upload endpoint removed to prevent adding ROMs via API/UI.
# Uploads were previously handled here; file-based metadata (.meta.json) remains on disk
# but we now exclude those sidecar files from listings. If you want to re-enable
# programmatic uploads later, add a controlled endpoint with proper auth and validation.



@app.get('/admin/stats')
async def get_admin_stats(db: Session = Depends(get_db)):
    """Return site-wide counts for users, posts, roms, and transactions."""
    total_users = db.query(models.User).count()
    total_posts = db.query(models.GameEntry).count()
    roms_dir = project_root / 'public' / 'roms'
    total_roms = 0
    if roms_dir.exists():
        total_roms = sum(1 for f in roms_dir.iterdir() if f.is_file() and not f.name.endswith('.meta.json'))
    total_transactions = db.query(models.Transaction).count()
    total_revenue = db.query(func.sum(models.Transaction.total_amount)).scalar() or 0.0
    return {
        'total_users': total_users,
        'total_posts': total_posts,
        'total_roms': total_roms,
        'total_transactions': total_transactions,
        'total_revenue': round(float(total_revenue), 2),
    }


@app.get('/admin/transactions')
async def get_admin_transactions(
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(get_optional_user)
):
    """Get all purchase transactions across all users for admin review."""
    txs = db.query(models.Transaction).order_by(models.Transaction.created_at.desc()).all()
    return [serialize_transaction(t) for t in txs]


@app.post('/transactions')
async def create_transaction(
    payload: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(get_optional_user),
):
    """Record a user purchase transaction."""
    username = current_user.username if current_user else 'Guest'
    user_id = current_user.id if current_user else None

    # Check if order already exists
    existing = db.query(models.Transaction).filter(models.Transaction.order_id == payload.order_id).first()
    if existing:
        return serialize_transaction(existing)

    tx = models.Transaction(
        order_id=payload.order_id,
        user_id=user_id,
        username=username,
        items_json=json.dumps(payload.items),
        total_amount=float(payload.total_amount),
        payment_method=payload.payment_method or 'Credit Card',
        status=payload.status or 'completed',
        created_at=datetime.utcnow(),
    )
    db.add(tx)
    try:
        db.commit()
        db.refresh(tx)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Could not record transaction: {str(e)}")

    # Log activity if user is signed in
    if current_user:
        try:
            item_titles = [i.get('title') for i in payload.items if i.get('title')]
            titles_str = ', '.join(item_titles[:2]) + ('...' if len(item_titles) > 2 else '')
            act = models.Activity(
                user_id=current_user.id,
                game_entry_id=None,
                verb='purchased',
                message=f"Purchased {titles_str or 'games'} ({payload.order_id})",
            )
            db.add(act)
            db.commit()
        except Exception:
            db.rollback()

    return serialize_transaction(tx)


@app.get('/')
async def root():
    return {'message': 'GameBoxd backend running'}
