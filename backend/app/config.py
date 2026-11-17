from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    secret_key: str = "change-me"
    database_url: str = "postgresql://clearplay:clearplay@localhost:5432/clearplay"
    redis_url: str = "redis://localhost:6379/0"
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    ai_provider: str | None = None
    ai_api_url: str | None = None
    ai_api_key: str | None = None
    ai_model: str | None = None

    class Config:
        env_file = "../.env"
        extra = "ignore"


settings = Settings()
