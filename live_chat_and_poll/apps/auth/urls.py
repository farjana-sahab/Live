from fastapi import APIRouter, WebSocket, Request, Depends
import re
from .views import live_key_validation, create_user_view, otp_view, login_view
from sqlalchemy.orm import Session
import database
from schemas import CreateUser, Otp
from helpers.token_validator import token_verify
import models
auth = APIRouter(
    tags=["auth"],
)

@auth.post("/live_key_validation")
async def auth_for_live_key(request: Request, db: Session=Depends(database.get_db)):
    return await live_key_validation(request=request, db=db)

@auth.post("/create_user")
async def create_user(user_schema: CreateUser, db: Session=Depends(database.get_db)):
    return await create_user_view(db=db, user_schema=user_schema)

@auth.post("/verify_otp")
async def verify_otp(otp_schema: Otp, db: Session=Depends(database.get_db)):
    return await otp_view(db=db, otp_schema=otp_schema)

@auth.post("/login")
async def login(user_schema: CreateUser, db: Session=Depends(database.get_db)):
    return await login_view(db=db, user_schema=user_schema)

@auth.get("/token-verify")
async def verify_token(authorized: bool = Depends(token_verify)):
    if authorized:
        return True
    return False


# @auth.get("/sample-veify-token")
# async def sample_verify_token(authorized: bool = Depends(token_verify),  db: Session=Depends(database.get_db)):
#     phone_number = authorized
#     is_exist = bool(db.query(models.User.phone_number).filter(models.User.phone_number == phone_number).first())
#     if not is_exist:
#         return False
#     return is_exist
