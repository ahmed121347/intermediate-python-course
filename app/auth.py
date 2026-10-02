import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

SECRET_KEY = "qyada_enterprise_secret_key_uae_erp_2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

DEMO_USERS = {
    "admin": {
        "username": "admin",
        "full_name_ar": "سعادة د. سلطان القاسمي",
        "full_name_en": "H.E. Dr. Sultan Al Qasimi",
        "role": "CEO",
        "password": "admin",
        "company_id": 1,
        "branch_id": 1,
        "allowed_companies": [1, 2, 3, 4, 5],
        "allowed_branches": [1, 2, 3, 4, 5, 6]
    },
    "pm_director": {
        "username": "pm_director",
        "full_name_ar": "م. إبراهيم المنصوري",
        "full_name_en": "Eng. Ibrahim Al Mansoori",
        "role": "Project Director",
        "password": "admin",
        "company_id": 2,
        "branch_id": 2,
        "allowed_companies": [2],
        "allowed_branches": [2, 3]
    },
    "cfo": {
        "username": "cfo",
        "full_name_ar": "أحمد الشامسي",
        "full_name_en": "Ahmed Al Shamsi",
        "role": "CFO",
        "password": "admin",
        "company_id": 1,
        "branch_id": 1,
        "allowed_companies": [1, 2, 3, 4, 5],
        "allowed_branches": [1, 2, 3, 4, 5, 6]
    }
}

def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    user = DEMO_USERS.get(username)
    if user and user["password"] == password:
        return user
    return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
