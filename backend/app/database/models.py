import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserProfile(Base):
    __tablename__ = "user_profiles"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    settings: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Content(Base):
    __tablename__ = "contents"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id: Mapped[str | None] = mapped_column(String(200), index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content_type: Mapped[str] = mapped_column(String(30), nullable=False, default="movie")
    release_year: Mapped[int | None] = mapped_column(Integer)
    normalized_title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)


class Episode(Base):
    __tablename__ = "episodes"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("contents.id", ondelete="CASCADE"), nullable=False, index=True)
    season_number: Mapped[int | None] = mapped_column(Integer)
    episode_number: Mapped[int | None] = mapped_column(Integer)
    duration_ms: Mapped[int | None] = mapped_column(Integer)
    version_fingerprint: Mapped[str | None] = mapped_column(String(200))


class CutManifest(Base):
    __tablename__ = "cut_manifests"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    episode_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("episodes.id", ondelete="CASCADE"), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="draft")
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    source: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    segments: Mapped[list["CutSegment"]] = relationship(back_populates="manifest", cascade="all, delete-orphan")


class CutSegment(Base):
    __tablename__ = "cut_segments"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    manifest_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cut_manifests.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    start_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    end_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    manifest: Mapped[CutManifest] = relationship(back_populates="segments")
