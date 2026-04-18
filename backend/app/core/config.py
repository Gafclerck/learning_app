from pydantic_settings import BaseSettings
from dotenv import load_dotenv
load_dotenv()
class Settings(BaseSettings):
    PROJECT_NAME: str 
    API_STR: str 
    SECRET_KEY: str
    ALGORITHM: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    VERIFICATION_CODE_EXPIRE_MINUTES: int = 15
    all_cors_origins: list = ["*"]
    ENVIRONMENT: str = "local"


settings = Settings()