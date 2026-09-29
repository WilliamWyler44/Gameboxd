from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, UniqueConstraint, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    profile_pic = Column(String(1000), nullable=True)
    genres = Column(Text, nullable=True)
    is_admin = Column(Boolean, nullable=False, default=False)

    games = relationship('GameEntry', back_populates='user')
    comments = relationship('PostComment', back_populates='user')
    post_reactions = relationship('PostReaction', back_populates='user')
    comment_reactions = relationship('CommentReaction', back_populates='user')


class Follow(Base):
    __tablename__ = 'follows'
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    following_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('follower_id', 'following_id', name='uix_follow_pair'),
    )


class FollowNotification(Base):
    __tablename__ = 'follow_notifications'
    id = Column(Integer, primary_key=True, index=True)
    recipient_user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    actor_user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    game_entry_id = Column(Integer, ForeignKey('game_entries.id'), nullable=False, index=True)
    verb = Column(String(50), nullable=False, default='new_post')
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('recipient_user_id', 'actor_user_id', 'game_entry_id', name='uix_follow_notification_unique'),
    )


class FollowEventNotification(Base):
    __tablename__ = 'follow_event_notifications'
    id = Column(Integer, primary_key=True, index=True)
    recipient_user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    actor_user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    verb = Column(String(50), nullable=False, default='followed_you')
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('recipient_user_id', 'actor_user_id', 'verb', name='uix_follow_event_notification_unique'),
    )

class GameEntry(Base):
    __tablename__ = 'game_entries'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    rawg_id = Column(Integer, nullable=False)
    slug = Column(String(200), nullable=True)
    title = Column(String(300), nullable=True)
    cover_url = Column(String(1000), nullable=True)
    rating = Column(Integer, nullable=True)
    status = Column(String(30), nullable=False, default='library')
    review = Column(Text, nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='games')
    comments = relationship('PostComment', back_populates='game_entry', cascade='all, delete-orphan')
    reactions = relationship('PostReaction', back_populates='game_entry', cascade='all, delete-orphan')

    __table_args__ = (
        UniqueConstraint('user_id', 'rawg_id', name='uix_user_rawg'),
    )


class Activity(Base):
    __tablename__ = 'activities'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    game_entry_id = Column(Integer, ForeignKey('game_entries.id'), nullable=True)
    verb = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User')


class PostComment(Base):
    __tablename__ = 'post_comments'
    id = Column(Integer, primary_key=True, index=True)
    game_entry_id = Column(Integer, ForeignKey('game_entries.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey('post_comments.id'), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    game_entry = relationship('GameEntry', back_populates='comments')
    user = relationship('User', back_populates='comments')
    reactions = relationship('CommentReaction', back_populates='comment', cascade='all, delete-orphan')


class PostReaction(Base):
    __tablename__ = 'post_reactions'
    id = Column(Integer, primary_key=True, index=True)
    game_entry_id = Column(Integer, ForeignKey('game_entries.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    value = Column(Integer, nullable=False)  # 1=like, -1=dislike
    created_at = Column(DateTime, default=datetime.utcnow)

    game_entry = relationship('GameEntry', back_populates='reactions')
    user = relationship('User', back_populates='post_reactions')

    __table_args__ = (
        UniqueConstraint('game_entry_id', 'user_id', name='uix_post_reaction_user'),
    )


class CommentReaction(Base):
    __tablename__ = 'comment_reactions'
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey('post_comments.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    value = Column(Integer, nullable=False)  # 1=like, -1=dislike
    created_at = Column(DateTime, default=datetime.utcnow)

    comment = relationship('PostComment', back_populates='reactions')
    user = relationship('User', back_populates='comment_reactions')

    __table_args__ = (
        UniqueConstraint('comment_id', 'user_id', name='uix_comment_reaction_user'),
    )


class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    username = Column(String(50), nullable=False, default='Guest')
    items_json = Column(Text, nullable=False)  # JSON string of items [{title, price, platform, key, coverUrl}]
    total_amount = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String(100), nullable=True)
    status = Column(String(30), nullable=False, default='completed')
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User')

