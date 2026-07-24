from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://abyssal:abyssal_pass@localhost:5432/abyssal_erp"
    redis_url: str = ""
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    cors_origins: str = "http://localhost:3000,https://pescaderia-app.vercel.app"
    refresh_token_expire_minutes: int = 43200

    class Config:
        env_file = ".env"

    def validate(self):
        if self.secret_key == "change-this-in-production":
            raise ValueError("SECRET_KEY is set to default value 'change-this-in-production'. Set a strong random key in production.")
        return self

# TODO: In production, this try/except should be removed so a missing SECRET_KEY crashes startup.
try:
    settings = Settings().validate()
except ValueError as e:
    import logging
    logging.warning(str(e))
    settings = Settings()
