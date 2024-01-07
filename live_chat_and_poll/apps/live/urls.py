from fastapi import APIRouter, WebSocket, Depends
import schemas
from .views import create_live_obj, get_all_live_obj, get_specific_live_by_id, get_specific_live_by_live_key, update_live_obj
from sqlalchemy.orm import Session
import database

live = APIRouter(
    tags=["live"],
)

@live.get("/live")
async def get_live( db: Session=Depends(database.get_db)):
    return await get_all_live_obj(db=db)

@live.get("/retrive_live_by_id/{id}")
async def get_live_by_id(id, db: Session=Depends(database.get_db)):
    return await get_specific_live_by_id(id=id, db=db)

@live.get("/retrive_live_by_key/{live_key}")
async def get_live_by_live_key(live_key: str, db: Session=Depends(database.get_db)):
    print(live_key)
    return await get_specific_live_by_live_key(live_key=live_key, db=db)

@live.post("/create_live")
async def create_live(live_schema:schemas.Live, db: Session=Depends(database.get_db)):
    return await create_live_obj(live_schema=live_schema, db=db)

@live.patch("/update_live/{live_key}")
async def update_live(live_key: str, live_update_schema:schemas.UpdateLive, db: Session=Depends(database.get_db)):
    return await update_live_obj(live_update_schema=live_update_schema, key=live_key, db=db)