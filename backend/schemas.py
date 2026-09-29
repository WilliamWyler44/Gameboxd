from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_admin: bool = False

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserSearchResult(BaseModel):
    username: str
    profile_pic: Optional[str] = None

class GameCreate(BaseModel):
    rawg_id: Union[int, str]
    status: str  # playing, completed, library
    review: Optional[str] = None
    rating: Optional[int] = None

class GameOut(BaseModel):
    id: int
    rawg_id: int
    slug: Optional[str]
    title: Optional[str]
    cover_url: Optional[str]
    rating: Optional[int]
    status: str
    review: Optional[str]
    added_at: Optional[datetime]

    class Config:
        orm_mode = True


class ProfileUpdate(BaseModel):
    profile_pic: Optional[str] = None
    genres: Optional[list[str]] = None


class UserProfileOut(BaseModel):
    username: str
    profile_pic: Optional[str]
    genres: Optional[list[str]]
    games: list[GameOut] = []
    follower_count: int = 0
    following_count: int = 0
    is_following: bool = False

    class Config:
        orm_mode = True


class ActivityOut(BaseModel):
    id: int
    user_id: int
    game_entry_id: Optional[int]
    verb: str
    message: Optional[str]
    created_at: Optional[datetime]

    class Config:
        orm_mode = True


class GameReviewOut(BaseModel):
    username: str
    profile_pic: Optional[str]
    rating: Optional[int]
    review: Optional[str]
    added_at: Optional[datetime]

    class Config:
        orm_mode = True


class PostCommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class PostCommentOut(BaseModel):
    id: int
    game_entry_id: int
    parent_id: Optional[int]
    user_id: int
    username: str
    profile_pic: Optional[str]
    content: str
    like_count: int = 0
    dislike_count: int = 0
    my_reaction: int = 0
    created_at: Optional[datetime]

    class Config:
        orm_mode = True


class ReactionCreate(BaseModel):
    value: int  # 1=like, -1=dislike


class ReactionSummaryOut(BaseModel):
    likes: int
    dislikes: int
    my_reaction: int = 0


class FollowStatusOut(BaseModel):
    username: str
    follower_count: int
    following_count: int
    is_following: bool


class FollowActionOut(BaseModel):
    ok: bool
    username: str
    is_following: bool
    follower_count: int
    following_count: int


class FollowNotificationOut(BaseModel):
    id: int
    verb: str
    actor_username: str
    actor_profile_pic: Optional[str]
    game_entry_id: Optional[int]
    game_title: Optional[str]
    game_cover_url: Optional[str]
    message: str
    is_read: bool
    created_at: Optional[datetime]


class FollowingFeedItemOut(BaseModel):
    id: int
    post_id: int
    author_username: str
    author_profile_pic: Optional[str]
    title: Optional[str]
    cover_url: Optional[str]
    review: Optional[str]
    status: str
    rating: Optional[int]
    added_at: Optional[datetime]

    class Config:
        orm_mode = True


class TransactionCreate(BaseModel):
    order_id: str
    items: list[dict]
    total_amount: float
    payment_method: Optional[str] = 'Credit Card'
    status: Optional[str] = 'completed'


class TransactionOut(BaseModel):
    id: int
    order_id: str
    user_id: Optional[int] = None
    username: str
    profile_pic: Optional[str] = None
    items: list[dict] = []
    total_amount: float
    payment_method: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

