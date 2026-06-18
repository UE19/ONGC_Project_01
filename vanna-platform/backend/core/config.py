from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENCRYPTION_KEY: str

    # Database
    DATABASE_URL: str
    SYNC_DATABASE_URL: str = ""

    # Redis
    REDIS_URL: str
    REDIS_PASSWORD: str = ""

    # Vanna AI Service
    VANNA_SERVICE_URL: str = "http://vanna-service:8001"
    OPENAI_API_KEY: str = ""
    OLLAMA_MODEL: str = "gpt-4o-mini"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    API_RATE_LIMIT_PER_MINUTE: int = 100

    # CORS
    CORS_ORIGINS: str = "http://localhost,http://localhost:3000"

    # Environment
    ENVIRONMENT: str = "production"
    LOG_LEVEL: str = "INFO"
    
    # Trusting proxy headers (X-Forwarded-For)
    TRUST_X_FORWARDED: bool = False
    TRUSTED_PROXIES: str = ""  # comma-separated list of trusted proxy IPs


    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def trusted_proxies_list(self) -> List[str]:
        raw = (self.TRUSTED_PROXIES or "").strip()
        return [p.strip() for p in raw.split(",") if p.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
