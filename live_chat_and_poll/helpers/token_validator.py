from fastapi import Request
from jose import JWTError, jwt
from fastapi import Depends, FastAPI, HTTPException, status
import models
from database import SessionLocal
SECRET_KEY = "42864bfa52330430a3593689aca0468248888d736f9d8571e3b872a5ad370797"

ALGORITHM = "HS256"

def token_verify(req: Request):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "xxxxxxxxxx"},
    )

    try:
        token = req.headers["Authorization"]
        if not token:
            raise credentials_exception
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        db = SessionLocal()
        is_exist = bool(db.query(models.User.phone_number).filter(models.User.phone_number == phone_number).first())
        if not is_exist:
            return False
        return is_exist

    except KeyError:
        raise credentials_exception
    except JWTError:
        raise credentials_exception
