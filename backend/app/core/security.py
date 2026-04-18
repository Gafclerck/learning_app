import random
import string

from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
from models.user import User
from core.config import settings
from sqlalchemy.orm import Session
import jwt

password_hasher = PasswordHash.recommended()
DUMPMY_HASH = password_hasher.hash("dummygafarpassword")

def hash_password(password : str):  
    return password_hasher.hash(password)

def verify_password(password : str, hashed_password : str):
    return password_hasher.verify(password, hashed_password)

def authenticate_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        verify_password(password, DUMPMY_HASH)
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def generate_code():
    return "".join(random.choices(string.digits, k=6))