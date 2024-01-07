from fastapi import Request, Response
import re
from urllib.parse import parse_qs
import models
from apps.auth.crud import UserCurd
from helpers.response import CustomResponse
from sqlalchemy.exc import IntegrityError
from models import VideoStage
from sqlalchemy import update


async def live_key_validation(request, db):
    request_body = await request.body()
    data = parse_qs(request_body.decode('utf-8'))
    live_key = data.get('name', [''])[0]

    obj = db.query(models.Live.live_key).filter(models.Live.live_key == live_key).first()

    if bool(obj):
        new_status = VideoStage.LIVE_START.value
        update_obj = update(models.Live).where(models.Live.live_key == live_key).values(video_status=new_status)

        db.execute(update_obj)
        db.commit()
        return Response(status_code=200)
    return Response(status_code=400)

async def create_user_view(user_schema,db):
    user_crud_class_obj = UserCurd()
    response_cls_obj = CustomResponse()
    try:
        reponse = user_crud_class_obj.create_user(db=db, user_scema=user_schema)

        return response_cls_obj.success(data=reponse,message="User Created Successfully, please verify your otp", status_code=201)
    except IntegrityError as e:
        error = str(e.orig.args[0])
        return response_cls_obj.error(message=error)
    except Exception as e:
        print(e)
        return response_cls_obj.error(message="something went wrong")


async def otp_view(otp_schema, db):
    user_crud_class_obj = UserCurd()
    response_cls_obj = CustomResponse()
    reponse = user_crud_class_obj.validate_otp(db=db, otp=otp_schema.otp, phone_number=otp_schema.phone_number)
    print(reponse)

    return response_cls_obj.success(data=reponse,message="Otp validation success", status_code=200)

async def login_view(user_schema,db):
    user_crud_class_obj = UserCurd()
    response_cls_obj = CustomResponse()
    
    reponse = user_crud_class_obj.verify_user_phone_number_and_password_and_return_token(db=db, user_scema=user_schema)

    return response_cls_obj.success(data=reponse,message="Login Success", status_code=200)
    