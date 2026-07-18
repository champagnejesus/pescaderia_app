from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://abyssal:abyssal_pass@localhost:5432/abyssal_erp"
    redis_url: str = ""
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    cors_origins: str = "*"
    refresh_token_expire_minutes: int = 43200

    class Config:
        env_file = ".env"

    def validate(self):
        if self.secret_key == "change-this-in-production":
            import warnings
            warnings.warn("SECRET_KEY is set to default value. Set a strong random key in production.")
        return self

settings = Settings().validate()
