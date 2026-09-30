"""
VigiRail — Application configuration.

All settings are read from environment variables prefixed with `VIGIRAIL_`
(optionally from a `.env` file in the working directory).  See `.env.example`.

Security notes
--------------
* `VIGIRAIL_SECRET_KEY` signs JWTs.  It MUST be set explicitly in production;
  in development an ephemeral random key is generated at boot so the app still
  runs out of the box without weakening production behaviour.
* `VIGIRAIL_CORS_ORIGINS` is a comma-separated list (or JSON list) of allowed
  front-end origins.  Wildcards are never used.
"""

from __future__ import annotations

import logging
import secrets
from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("vigirail.config")

DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://localhost:3000",
]


class Settings(BaseSettings):
    """Runtime settings, overridable via `VIGIRAIL_*` environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="VIGIRAIL_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Identity ─────────────────────────────────────────────────────
    app_name: str = "VigiRail"
    app_version: str = "3.0.0"
    environment: Literal["development", "production"] = "development"

    # ── Security ─────────────────────────────────────────────────────
    secret_key: str = ""
    access_token_expire_minutes: int = Field(default=480, ge=5, le=60 * 24 * 14)
    login_rate_limit: int = Field(default=10, ge=1, le=1000)  # attempts …
    login_rate_window: int = Field(default=60, ge=1, le=3600)  # … per window (s)

    # ── CORS ─────────────────────────────────────────────────────────
    cors_origins: list[str] = Field(default_factory=lambda: list(DEFAULT_ORIGINS))

    # ── Telemetry / simulation ───────────────────────────────────────
    sensor_poll_seconds: int = Field(default=2, ge=1, le=60)
    max_history_records: int = Field(default=500, ge=10, le=100_000)
    max_alert_records: int = Field(default=200, ge=10, le=10_000)

    # ── Validators ───────────────────────────────────────────────────
    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        """Accept a comma-separated string, a JSON list, or a real list."""
        if isinstance(value, str):
            value = value.strip()
            if value.startswith("["):
                import json

                return json.loads(value)
            return [part.strip() for part in value.split(",") if part.strip()]
        return value

    @model_validator(mode="after")
    def _require_secret_in_production(self) -> Settings:
        if not self.secret_key:
            if self.environment == "production":
                raise ValueError(
                    "VIGIRAIL_SECRET_KEY must be set when VIGIRAIL_ENVIRONMENT=production. "
                    "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(48))\""
                )
            # Development only: ephemeral key, invalidates tokens on restart.
            self.secret_key = secrets.token_urlsafe(48)
            logger.warning(
                "VIGIRAIL_SECRET_KEY not set — generated an ephemeral development key. "
                "Set a persistent key before deploying."
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
