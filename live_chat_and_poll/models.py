from database import Base
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
import datetime
from enum import Enum
from sqlalchemy.sql import func
from sqlalchemy.types import TypeDecorator, DateTime
from datetime import datetime, timezone
from sqlalchemy.orm import relationship


class UTCDateTime(TypeDecorator):
    impl = DateTime(timezone=True)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return value.astimezone(timezone.utc)

    def process_result_value(self, value, dialect):
        if value is not None:
            return value.replace(tzinfo=timezone.utc)



class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    live_id = Column(Integer, ForeignKey("live.id"), index=True)
    question = Column(String, index=True)
    option = Column(JSON)
    correct_ans = Column(Integer)
    duration = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), server_default=func.now())

class Vote(Base):
    __tablename__ = "vote"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, unique=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    option_choosed = Column(Integer)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), server_default=func.now())


class LiveChat(Base):
    __tablename__ = "live_chat"

    id = Column(Integer, primary_key=True, index=True)
    live_id = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    user_name = Column(String, nullable=True)
    message = Column(String)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), server_default=func.now())


class VideoStage(Enum):
    NOT_START_PROCESSING = 1
    START_PROCESSING = 2
    UPLOAD_COMPLETE = 3
    UPLOAD_FAILED = 4
    LIVE_START = 5

class Live(Base):
    __tablename__ = "live"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    live_key = Column(String, unique=True)
    key_used = Column(Boolean, default=False)
    video_status = Column(Integer, default=VideoStage.NOT_START_PROCESSING.value)
    meta_data = Column(JSON, nullable=True)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True)
    password = Column(String)
    is_active = Column(Boolean, default=False)
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), server_default=func.now())

    otp = relationship("Otp", back_populates="user")


class Otp(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    otp = Column(String, index=True)
    is_used = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="otp")

class Token(Base):
    __tablename__ = "tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String)
    user = Column(Integer, ForeignKey("users.id"))
    created_at = Column(UTCDateTime(), server_default=func.now())
    updated_at = Column(UTCDateTime(), server_default=func.now())