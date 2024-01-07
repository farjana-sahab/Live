from passlib.context import CryptContext
from jose import JWTError, jwt
from typing import Annotated, Union
from datetime import datetime, timedelta
import models
from fastapi import FastAPI, HTTPException


class UserCurd:

    def __init__(self):
        self.SECRET_KEY = "42864bfa52330430a3593689aca0468248888d736f9d8571e3b872a5ad370797"
        self.ALGORITHM = "HS256"
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def get_password_hash(self, password):
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def __create_and_get_token(self, data, expires_delta: Union[timedelta, None] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=3600)
        to_encode.update({"exp": expire})

        return jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)


    def __create_otp(self, db, user_id):
        try:
            otp_number = 1234
            otp = models.Otp(user_id=user_id, otp=otp_number)
            db.add(otp)
            db.commit()
            db.refresh(otp)
            data = {
                "user_id": otp.user_id,
                "phone_number": otp.user.phone_number,
            }
            return data
        except Exception as e:
            db.rollback()
            raise e

    def validate_otp(self, db, otp, phone_number):
        try:
            otp = db.query(models.Otp).join(models.User).filter(models.User.phone_number == phone_number, models.Otp.otp == otp).first()
            if otp:
                user = otp.user
                user.is_active = True
                token = self.__create_and_get_token({"sub": user.phone_number})
                db.delete(otp)
                db.commit()
                return token

        except Exception as e:
            db.rollback()
            raise e

    def create_user(self, db, user_scema):
        try:
            hash_password = self.get_password_hash(user_scema.password)
            user = models.User(phone_number=user_scema.phone_number, password=hash_password)
            db.add(user)
            db.commit()
            db.refresh(user)

            otp = self.__create_otp(db, user.id)
            return otp
        except Exception as e:
            db.rollback()
            raise e

    def verify_user_phone_number_and_password_and_return_token(self, db, user_scema):
        user_obj = db.query(models.User).filter(models.User.phone_number == user_scema.phone_number, models.User.is_active==True).first()
        if not user_obj:
            raise HTTPException(status_code=404, detail="User not found or maybe inactive")
        if not self.verify_password(user_scema.password, user_obj.password):
            raise HTTPException(status_code=400, detail="Incorrect password")
        token = self.__create_and_get_token({"sub": user_obj.phone_number})
        return token




