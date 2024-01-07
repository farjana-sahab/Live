import schemas
from .crud import LiveCrud
from helpers.response import CustomResponse


async def create_live_obj(live_schema, db):
    live_crud_obj = LiveCrud()
    obj = live_crud_obj.create_live(db=db, live_schema=live_schema)
    return CustomResponse.success(data=obj, message="sucessfully retrive", status_code=201)

async def get_all_live_obj(db):
    live_crud_obj = LiveCrud()
    obj = live_crud_obj.get_all_live(db=db)
    response = CustomResponse.success(data=obj, message="sucessfully retrive", status_code=200)
    return response

async def get_specific_live_by_id(id, db):
    live_crud_obj = LiveCrud()
    obj = live_crud_obj.get_specific_live_by_id(db=db, id=id)
    return CustomResponse.success(data=obj, message="sucessfully retrive", status_code=200)

async def get_specific_live_by_live_key(live_key, db):
    live_crud_obj = LiveCrud()
    obj = live_crud_obj.get_specific_live_by_live_key(db=db, live_key=live_key)
    return CustomResponse.success(data=obj, message="sucessfully retrive", status_code=200)

async def update_live_obj(live_update_schema, key, db):
    live_crud_obj = LiveCrud()
    obj = live_crud_obj.update_live(db=db, live_update_schema=live_update_schema, key=key)
    return CustomResponse.success(data=obj, message="sucessfully retrive", status_code=202)
