"""
RailGuard AI — Application Configuration
Centralises all settings so they can be overridden via .env
"""
from pydantic import BaseModel


class Settings(BaseModel):
    APP_NAME: str = "RailGuard AI"
    APP_VERSION: str = "2.0.0"
    SECRET_KEY: str = "railguard-secret-2024-xk9p"
    SENSOR_UPDATE_INTERVAL: int = 2       # seconds
    MAX_HISTORY_RECORDS: int = 500
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
